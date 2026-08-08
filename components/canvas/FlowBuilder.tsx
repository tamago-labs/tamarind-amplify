"use client";

import { useCallback, useEffect, useState } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import Canvas from "./Canvas";
import CanvasCard from "./CanvasCard";
import CanvasLines from "./CanvasLines";
import Toolbar from "./Toolbar";
import IdentityPopover from "./IdentityPopover";
import { type CanvasNode, type CanvasConnection, type NodeRole, VALID_CONNECTIONS, CARD_WIDTH, CARD_HEIGHTS } from "./types";

const client = generateClient<Schema>();

interface FlowBuilderProps {
  workflowId: string;
  workspaceId: string;
  workflowName: string;
}

export default function FlowBuilder({ workflowId, workspaceId, workflowName: initialName }: FlowBuilderProps) {
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [connections, setConnections] = useState<CanvasConnection[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [locked, setLocked] = useState(false);
  const [popoverRole, setPopoverRole] = useState<NodeRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [workflowName, setWorkflowName] = useState(initialName);

  const load = useCallback(async () => {
    setLoading(true);
    const [nodesResult, connectionsResult] = await Promise.all([
      client.models.WorkflowNode.list({ filter: { workflowId: { eq: workflowId } } }),
      client.models.WorkflowConnection.list({ filter: { workflowId: { eq: workflowId } } }),
    ]);

    const nodesWithIdentity = await Promise.all(
      (nodesResult.data || []).map(async (n) => {
        let walletAddress = "";
        let chain = "";
        let internalStatus = "";
        let countries: string[] = [];
        let tier = "";
        let expirationTime: number | undefined;

        try {
          if (n.identityType === "organizationIdentity") {
            const { data: identity } = await client.models.OrganizationIdentity.get({ id: n.identityId });
            if (identity) {
              walletAddress = identity.walletAddress;
              chain = identity.chain;
              internalStatus = identity.internalStatus || "";
            }
            const { data: apass } = await client.queries.queryOrganizationApass({ workspaceId, organizationIdentityId: n.identityId });
            if (apass?.countries) countries = apass.countries.filter((c): c is string => c !== null);
            if (apass?.tier) tier = apass.tier;
            if (apass?.expirationTime) expirationTime = apass.expirationTime;
          } else {
            const { data: identity } = await client.models.WorkspaceIdentity.get({ id: n.identityId });
            if (identity) {
              internalStatus = identity.internalStatus || "";
            }
            const { data: apass } = await client.queries.queryApass({ workspaceId, workspaceIdentityId: n.identityId });
            if (apass?.countries) countries = apass.countries.filter((c): c is string => c !== null);
            if (apass?.tier) tier = apass.tier;
            if (apass?.expirationTime) expirationTime = apass.expirationTime;
          }
        } catch {}

        return {
          id: n.id,
          workflowId: n.workflowId,
          identityType: n.identityType as CanvasNode["identityType"],
          identityId: n.identityId,
          nodeRole: n.nodeRole as NodeRole,
          label: n.label || "Untitled",
          x: n.positionX,
          y: n.positionY,
          walletAddress,
          chain,
          internalStatus,
          countries,
          tier,
          expirationTime,
        };
      })
    );

    setNodes(nodesWithIdentity);
    setConnections(
      (connectionsResult.data || []).map((c) => ({
        id: c.id,
        workflowId: c.workflowId,
        fromNodeId: c.fromNodeId,
        toNodeId: c.toNodeId,
        flowType: c.flowType as CanvasConnection["flowType"],
        templateId: c.templateId || undefined,
        templateVersion: c.templateVersion || undefined,
        amountMode: c.amountMode as CanvasConnection["amountMode"],
        fixedAmount: c.fixedAmount || undefined,
        currency: c.currency || undefined,
        chain: c.chain || undefined,
        approvalRequired: c.approvalRequired || undefined,
      }))
    );
    setLoading(false);
  }, [workflowId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, delta } = event;
      const nodeId = active.data.current?.placementId;
      if (!nodeId) return;
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id !== nodeId) return n;
          const newX = n.x + delta.x;
          const newY = n.y + delta.y;
          client.models.WorkflowNode.update({ id: n.id, positionX: newX, positionY: newY });
          return { ...n, x: newX, y: newY };
        })
      );
    },
    []
  );

  const handleAddNode = useCallback(
    (role: NodeRole) => {
      setPopoverRole(role);
    },
    []
  );

  const handleSelectIdentity = useCallback(
    async (item: { id: string; label: string; walletAddress: string; chain: string; countries?: string[]; tier?: string; expirationTime?: number }) => {
      if (!popoverRole) return;
      const identityType = popoverRole === "company" ? "organizationIdentity" : "workspaceIdentity";
      const existingNodes = nodes.filter((n) => n.nodeRole === popoverRole);
      const x = 200 + existingNodes.length * 50;
      const y = 200 + existingNodes.length * 50;
      const { data } = await client.models.WorkflowNode.create({
        workflowId,
        identityType,
        identityId: item.id,
        nodeRole: popoverRole,
        label: item.label,
        positionX: x,
        positionY: y,
      });
      if (data) {
        setNodes((prev) => [
          ...prev,
          {
            id: data.id,
            workflowId,
            identityType,
            identityId: item.id,
            nodeRole: popoverRole,
            label: item.label,
            x,
            y,
            walletAddress: item.walletAddress,
            chain: item.chain,
            countries: item.countries,
            tier: item.tier,
            expirationTime: item.expirationTime,
          },
        ]);
      }
      setPopoverRole(null);
    },
    [popoverRole, nodes, workflowId]
  );

  const handlePortClick = useCallback(
    (nodeId: string, portType: "input" | "output") => {
      if (portType === "output") {
        setConnectFrom(nodeId);
        setSelectedConnectionId(null);
      } else if (portType === "input" && connectFrom) {
        const fromNode = nodes.find((n) => n.id === connectFrom);
        const toNode = nodes.find((n) => n.id === nodeId);
        if (!fromNode || !toNode) return;
        const valid = VALID_CONNECTIONS.find((v) => v.from === fromNode.nodeRole && v.to === toNode.nodeRole);
        if (!valid) {
          setConnectFrom(null);
          return;
        }
        const exists = connections.some(
          (c) => c.fromNodeId === connectFrom && c.toNodeId === nodeId
        );
        if (exists) {
          setConnectFrom(null);
          return;
        }
        client.models.WorkflowConnection.create({
          workflowId,
          fromNodeId: connectFrom,
          toNodeId: nodeId,
          flowType: valid.flowType,
        }).then(({ data }) => {
          if (data) {
            setConnections((prev) => [
              ...prev,
              {
                id: data.id,
                workflowId,
                fromNodeId: connectFrom,
                toNodeId: nodeId,
                flowType: valid.flowType,
              },
            ]);
          }
        });
        setConnectFrom(null);
      }
    },
    [connectFrom, nodes, connections, workflowId]
  );

  const handleDeleteNode = useCallback(
    async (nodeId: string) => {
      await client.models.WorkflowNode.delete({ id: nodeId });
      setNodes((prev) => prev.filter((n) => n.id !== nodeId));
      setConnections((prev) => prev.filter((c) => c.fromNodeId !== nodeId && c.toNodeId !== nodeId));
      setSelectedNodeId(null);
    },
    []
  );

  const handleSelectConnection = useCallback((connId: string) => {
    setSelectedConnectionId(connId);
    setSelectedNodeId(null);
  }, []);

  const handleSelectNode = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setSelectedConnectionId(null);
    setConnectFrom(null);
  }, []);

  const handleCanvasClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedConnectionId(null);
    setConnectFrom(null);
  }, []);

  const handleNameChange = useCallback(
    async (name: string) => {
      setWorkflowName(name);
      await client.models.Workflow.update({ id: workflowId, name });
    },
    [workflowId]
  );

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-gray-500">Loading canvas...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Toolbar
        workflowId={workflowId}
        workspaceId={workspaceId}
        workflowName={workflowName}
        zoom={zoom}
        onZoomChange={setZoom}
        onAddNode={handleAddNode}
        onNameChange={handleNameChange}
        locked={locked}
      />
      {connectFrom && (
        <div className="bg-green-50 px-4 py-2 text-center text-xs font-medium text-green-700">
          Click an input port to connect
        </div>
      )}
      <div className="flex-1">
        <DndContext onDragEnd={handleDragEnd}>
          <Canvas zoom={zoom} onZoomChange={setZoom}>
            <div onClick={handleCanvasClick}>
              <CanvasLines
                nodes={nodes}
                connections={connections}
                selectedId={selectedConnectionId}
                onSelect={handleSelectConnection}
              />
              {nodes.map((node) => (
                <CanvasCard
                  key={node.id}
                  node={node}
                  isSelected={node.id === selectedNodeId}
                  locked={locked}
                  onSelect={handleSelectNode}
                  onDelete={handleDeleteNode}
                  onPortClick={handlePortClick}
                  connectFrom={connectFrom}
                />
              ))}
            </div>
          </Canvas>
        </DndContext>
      </div>
      {popoverRole && (
        <IdentityPopover
          role={popoverRole}
          workspaceId={workspaceId}
          onSelect={handleSelectIdentity}
          onClose={() => setPopoverRole(null)}
        />
      )}
    </div>
  );
}
