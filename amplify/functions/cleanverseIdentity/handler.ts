import crypto from "node:crypto";
import type { Schema } from "../../data/resource.js";
import { Amplify } from "aws-amplify";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { generateClient } from "aws-amplify/data";
import { env } from "$amplify/env/cleanverseIdentity";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();
const IV = Buffer.alloc(16, 0);
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;
const chainSlugs = new Set(["base", "ethereum", "monad"]);

type Identity = { sub?: string; username?: string } | undefined;

function actorId(identity: Identity) {
  const id = identity?.username || identity?.sub;
  if (!id) throw new Error("Authenticated user is required");
  return id;
}

function customerIdFor(userId: string) {
  return `TAMARIND${crypto.createHash("sha256").update(userId).digest("hex").slice(0, 24).toUpperCase()}`;
}

function identityIdFor(userId: string, chain: string) {
  return crypto.createHash("sha256").update(`${userId}:${chain}`).digest("hex");
}

function workspaceIdentityIdFor(workspaceId: string, walletIdentityId: string) {
  return crypto.createHash("sha256").update(`${workspaceId}:${walletIdentityId}`).digest("hex");
}

function normalizeChain(chain: string) {
  const value = chain.toLowerCase();
  if (!chainSlugs.has(value)) throw new Error("Unsupported Cleanverse chain");
  return value;
}

function encrypt(body: object) {
  const key = Buffer.from(env.CLEANVERSE_API_KEY, "base64");
  const cipher = crypto.createCipheriv("aes-256-cbc", key, IV);
  return Buffer.concat([cipher.update(JSON.stringify(body), "utf8"), cipher.final()]).toString("base64");
}

async function cleanverseRequest<T>(path: string, body: object, encrypted = false): Promise<{ code: string; message: string; data: T }> {
  const response = await fetch(`${env.CLEANVERSE_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-id": env.CLEANVERSE_API_ID, "X-Request-ID": crypto.randomUUID() },
    body: JSON.stringify(encrypted ? { data: encrypt(body) } : body),
  });
  const payload = await response.json() as { code: string; message: string; data: T };
  if (!response.ok || payload.code !== "0000") throw new Error(payload.message || `Cleanverse request failed (${payload.code})`);
  return payload;
}

async function memberFor(workspaceId: string, userId: string) {
  const { data: members } = await client.models.WorkspaceMember.list({ filter: { workspaceId: { eq: workspaceId }, userId: { eq: userId } } });
  return members?.[0];
}

async function canManage(workspaceId: string, userId: string) {
  const member = await memberFor(workspaceId, userId);
  if (!member || (member.role !== "admin" && member.role !== "company") || member.status !== "active") throw new Error("Company identity access is required");
  return member;
}

async function queryIdentity(workspaceIdentityId: string, actor: string, workspaceId: string) {
  const { data: workspaceIdentity } = await client.models.WorkspaceIdentity.get({ id: workspaceIdentityId });
  if (!workspaceIdentity || workspaceIdentity.workspaceId !== workspaceId) throw new Error("Identity not found");
  if (workspaceIdentity.userId !== actor) await canManage(workspaceId, actor);
  const { data: identity } = await client.models.WalletIdentity.get({ id: workspaceIdentity.walletIdentityId });
  if (!identity) throw new Error("Wallet identity not found");
  const result = await cleanverseRequest<{
    cvRecordId?: string;
    tier?: string;
    subTier?: number;
    group?: string;
    subGroup?: string;
    countries?: string[];
    expirationTime?: number;
    currentKycHash?: string;
    status?: number;
  }>("/query_apass", { chain: identity.chain, address: identity.walletAddress });
  return {
    walletAddress: identity.walletAddress,
    chain: identity.chain,
    cvRecordId: result.data?.cvRecordId,
    tier: result.data?.tier,
    subTier: result.data?.subTier,
    group: result.data?.group,
    subGroup: result.data?.subGroup,
    countries: result.data?.countries || [],
    expirationTime: result.data?.expirationTime,
    currentKycHash: result.data?.currentKycHash,
    cleanverseStatus: result.data?.status,
    internalStatus: workspaceIdentity.internalStatus || "pending",
    ownershipVerified: Boolean(workspaceIdentity.ownershipVerifiedAt),
  };
}

type IdentityEvent = { arguments: Record<string, any>; identity?: Identity; info: { fieldName: string } };

export const handler = async (event: IdentityEvent) => {
  const actor = actorId(event.identity as Identity);
  const args = event.arguments;

  if (event.info.fieldName === "generateApass") {
    const chain = normalizeChain(args.chain);
    const member = await memberFor(args.workspaceId, actor);
    if (!member || member.status !== "active") throw new Error("Active workspace membership is required");
    const walletIdentityId = identityIdFor(actor, chain);
    const { data: existing } = await client.models.WalletIdentity.get({ id: walletIdentityId });
    if (existing && existing.walletAddress.toLowerCase() !== args.walletAddress.toLowerCase()) throw new Error("A different wallet is already registered for this network");
    if (!existing) {
      await cleanverseRequest("/generate_apass", {
        customerId: customerIdFor(actor),
        expirationTime: Math.floor(Date.now() / 1000) + ONE_YEAR_SECONDS,
        wallet: { address: args.walletAddress, chain },
      }, true);
      await client.models.WalletIdentity.create({ id: walletIdentityId, userId: actor, walletAddress: args.walletAddress, chain });
    }
    const workspaceIdentityId = workspaceIdentityIdFor(args.workspaceId, walletIdentityId);
    const { data: existingLink } = await client.models.WorkspaceIdentity.get({ id: workspaceIdentityId });
    if (existingLink) throw new Error("This identity is already connected to the workspace");
    await client.models.WorkspaceIdentity.create({ id: workspaceIdentityId, workspaceId: args.workspaceId, userId: actor, walletIdentityId, internalStatus: "pending", ownershipMessage: args.ownershipMessage, ownershipSignature: args.ownershipSignature });
    return queryIdentity(workspaceIdentityId, actor, args.workspaceId);
  }

  if (event.info.fieldName === "queryApass") return queryIdentity(args.workspaceIdentityId, actor, args.workspaceId);

  if (event.info.fieldName === "updateWalletIdentityStatus") {
    await canManage(args.workspaceId, actor);
    const { data: identity } = await client.models.WorkspaceIdentity.get({ id: args.workspaceIdentityId });
    if (!identity || identity.workspaceId !== args.workspaceId) throw new Error("Identity not found");
    const now = new Date().toISOString();
    const { data: updated } = await client.models.WorkspaceIdentity.update({ id: args.workspaceIdentityId, internalStatus: args.internalStatus, statusNote: args.statusNote, statusUpdatedAt: now, statusUpdatedBy: actor });
    return { success: Boolean(updated), statusUpdatedAt: now };
  }

  if (event.info.fieldName === "verifyWalletIdentity") {
    await canManage(args.workspaceId, actor);
    const { data: identity } = await client.models.WorkspaceIdentity.get({ id: args.workspaceIdentityId });
    if (!identity || identity.workspaceId !== args.workspaceId) throw new Error("Identity not found");
    const now = new Date().toISOString();
    const { data: updated } = await client.models.WorkspaceIdentity.update({ id: args.workspaceIdentityId, ownershipVerifiedAt: now, ownershipVerifiedBy: actor });
    return { success: Boolean(updated), verifiedAt: now };
  }

  throw new Error(`Unsupported identity operation: ${event.info.fieldName}`);
};
