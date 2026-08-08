"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2 } from "lucide-react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import type { CanvasConnection, CanvasNode } from "./types";
import { DEFAULT_TOKENS } from "@/config/tokens";
import { fieldsByDocumentType, type TemplateField, type DocumentType } from "@/lib/templateOptions";

const client = generateClient<Schema>();

interface TemplateRecord {
  id: string;
  name: string;
  documentType: string;
  version: number;
  fields: TemplateField[];
}

interface LineItem {
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
}

interface DocumentDrawerProps {
  connection: CanvasConnection;
  fromNode: CanvasNode | undefined;
  toNode: CanvasNode | undefined;
  workspaceId: string;
  onSave: (connectionId: string, data: Partial<CanvasConnection>) => void;
  onDelete: (connectionId: string) => void;
  onClose: () => void;
}

const SAMPLE_VALUES: Record<string, string> = {
  companyName: "Acme Corp",
  senderName: "Acme Corp",
  recipientName: "John Doe",
  amount: "1,000.00",
  currency: "USDC",
  paymentDate: new Date().toLocaleDateString(),
  chain: "Base Sepolia",
  txHash: "0x1234...abcd",
  settlementId: "STL-001",
  merkleRoot: "0xabcd...1234",
  status: "Completed",
  notes: "Payment for services",
  invoiceNumber: "INV-1001",
  issueDate: new Date().toLocaleDateString(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
  lineItems: "Professional services\n1 x 1,000.00",
  subtotal: "1,000.00",
  tax: "0.00",
  total: "1,000.00",
  approvalStatus: "Pending",
  employeeName: "Alex Morgan",
  payPeriod: "July 2026",
  grossPay: "5,000.00",
  deductions: "800.00",
  netPay: "4,200.00",
};

export default function DocumentDrawer({ connection, fromNode, toNode, workspaceId, onSave, onDelete, onClose }: DocumentDrawerProps) {
  const flowType = connection.flowType;
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("");
  const [docName, setDocName] = useState("");
  const [fieldValues, setFieldValue] = useState<Record<string, string>>({});
  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: "Service", quantity: "1", unitPrice: "", amount: "" }]);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState<Array<{ symbol: string; name: string; tokenAddress: string; chain: string; tokenType: string }>>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data: workspaceTokens } = await client.models.WorkspaceToken.list({
        filter: { workspaceId: { eq: workspaceId } },
      });

      const allTokens = [
        ...DEFAULT_TOKENS.filter((t) => t.tokenType === "A_TOKEN" || t.tokenType === "WRAPPED_TOKEN").map((t) => ({
          symbol: t.symbol,
          name: t.name,
          tokenAddress: t.tokenAddress,
          chain: t.chain,
          tokenType: t.tokenType,
        })),
        ...(workspaceTokens || []).filter((t) => t.tokenType === "A_TOKEN" || t.tokenType === "WRAPPED_TOKEN").map((t) => ({
          symbol: t.symbol,
          name: t.name,
          tokenAddress: t.tokenAddress,
          chain: t.chain,
          tokenType: t.tokenType || "ERC20",
        })),
      ];

      const uniqueTokens = allTokens.filter((t, i, arr) => 
        arr.findIndex((x) => x.symbol === t.symbol && x.chain === t.chain) === i
      );

      setTokens(uniqueTokens);

      const { data } = await client.models.DocumentTemplate.list({
        filter: { workspaceId: { eq: workspaceId }, status: { eq: "published" } },
      });
      const filtered = (data || []).filter((t) => {
        if (flowType === "invoice") return t.documentType === "invoice";
        return t.documentType === "payment";
      }).map((t) => ({
        id: t.id,
        name: t.name,
        documentType: t.documentType || "payment",
        version: t.version || 1,
        fields: (typeof t.fields === "string" ? JSON.parse(t.fields) : t.fields) as TemplateField[],
      }));
      setTemplates(filtered);

      if (connection.templateId) setSelectedTemplateId(connection.templateId);
      if (connection.fixedAmount) setAmount(connection.fixedAmount);
      if (connection.currency) setCurrency(connection.currency);

      if (connection.configuration) {
        try {
          const config = typeof connection.configuration === "string" ? JSON.parse(connection.configuration) : connection.configuration;
          if (config.fieldValues) setFieldValue(config.fieldValues);
          if (config.lineItems) setLineItems(config.lineItems);
          if (config.docName) setDocName(config.docName);
        } catch {}
      }
      setLoading(false);
    }
    load();
  }, [workspaceId, connection]);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const dynamicFields = selectedTemplate?.fields.filter((f) => !f.locked && f.key !== "lineItems") || [];

  function updateFieldValue(key: string, value: string) {
    setFieldValue((prev) => ({ ...prev, [key]: value }));
  }

  function addLineItem() {
    setLineItems((prev) => [...prev, { description: "", quantity: "1", unitPrice: "", amount: "" }]);
  }

  function removeLineItem(index: number) {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateLineItem(index: number, field: keyof LineItem, value: string) {
    setLineItems((prev) => prev.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };
      if (field === "quantity" || field === "unitPrice") {
        const qty = parseFloat(updated.quantity) || 0;
        const price = parseFloat(updated.unitPrice) || 0;
        updated.amount = (qty * price).toString();
      }
      return updated;
    }));
  }

  function generatePreviewHtml(): string {
    if (!selectedTemplate) return "<p>Select a template to preview</p>";

    const currencySymbol = currency.split("-")[0] || "";
    const allFields: Record<string, string> = {
      companyName: "Company Name",
      senderName: fromNode?.label || "Sender",
      recipientName: toNode?.label || "Recipient",
      amount: amount || "0",
      currency: currencySymbol,
      paymentDate: new Date().toLocaleDateString(),
      chain: "Base Sepolia",
      txHash: "Pending...",
      ...fieldValues,
    };

    let html = `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; color: #333; }
  h1 { border-bottom: 2px solid #7FD9B0; padding-bottom: 10px; margin-bottom: 5px; font-size: 20px; }
  .subtitle { color: #666; margin-bottom: 30px; }
  .section { margin: 20px 0; }
  .section-title { font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
  .field { margin: 12px 0; }
  .label { color: #666; font-size: 12px; }
  .value { font-size: 16px; color: #333; }
  .textarea { background: #f9f9f9; padding: 12px; border-radius: 6px; min-height: 60px; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 11px; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; }
  th, td { border: 1px solid #eee; padding: 8px; text-align: left; font-size: 12px; }
  th { background: #f9f9f9; }
</style>
</head>
<body>
  <h1>${docName || selectedTemplate.name}</h1>
  <div class="subtitle">${flowType === "invoice" ? "Invoice" : "Payment Receipt"}</div>
  
  <div class="section">
    <div class="section-title">Details</div>
    <div class="field"><div class="label">From</div><div class="value">${fromNode?.label || "Sender"}</div></div>
    <div class="field"><div class="label">To</div><div class="value">${toNode?.label || "Recipient"}</div></div>
    <div class="field"><div class="label">Amount</div><div class="value">${amount || "0"} ${currencySymbol}</div></div>
    <div class="field"><div class="label">Date</div><div class="value">${new Date().toLocaleDateString()}</div></div>
  </div>`;

    if (flowType === "invoice" && lineItems.length > 0) {
      html += `
  <div class="section">
    <div class="section-title">Line Items</div>
    <table>
      <tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr>
      ${lineItems.map((item) => `<tr><td>${item.description || "-"}</td><td>${item.quantity || "0"}</td><td>${item.unitPrice || "0"}</td><td>${item.amount || "0"}</td></tr>`).join("")}
    </table>
  </div>`;
    }

    for (const field of dynamicFields) {
      const value = fieldValues[field.key] || SAMPLE_VALUES[field.key] || `[${field.label}]`;
      html += `
  <div class="field"><div class="label">${field.label}</div><div class="value">${value}</div></div>`;
    }

    html += `
  <div class="footer">
    <div class="field"><div class="label">Chain</div><div class="value">Base Sepolia</div></div>
    <div class="field"><div class="label">Transaction Hash</div><div class="value">Pending...</div></div>
    <div style="margin-top: 10px">Generated by Tamarind</div>
  </div>
</body>
</html>`;

    return html;
  }

  function handleSave() {
    const config = {
      fieldValues,
      lineItems: flowType === "invoice" ? lineItems : undefined,
      docName: docName || selectedTemplate?.name,
      currency,
    };
    onSave(connection.id, {
      templateId: selectedTemplateId || undefined,
      templateVersion: selectedTemplate?.version,
      fixedAmount: amount || undefined,
      currency,
      configuration: JSON.stringify(config),
    });
    onClose();
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex justify-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/30"
        />
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative flex h-full w-[760px] flex-col bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <p className="text-xs font-medium text-gray-500">{flowType === "invoice" ? "Invoice Flow" : "Payment Flow"}</p>
            <h2 className="text-base font-semibold text-gray-900">{fromNode?.label} → {toNode?.label}</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-[300px] overflow-y-auto border-r border-gray-200 p-5">
            {loading ? (
              <div className="py-8 text-center text-sm text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Amount</label>
                  <div className="grid grid-cols-[1fr_100px] gap-2">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="min-w-0 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                    />
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-[160px] shrink-0 rounded-lg border border-gray-200 px-2 py-2 text-sm outline-none focus:border-indigo-400"
                    >
                      <option value="">Select...</option>
                      {tokens.map((token) => (
                        <option key={`${token.symbol}-${token.chain}`} value={`${token.symbol}-${token.chain}`}>
                          {token.symbol} ({token.chain === "monad" ? "Monad" : "Base"})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Document Template</label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                  >
                    <option value="">Select template...</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} (v{t.version})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Document Name</label>
                  <input
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    placeholder={selectedTemplate?.name || "Document name"}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                  />
                </div>

                {dynamicFields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">{field.label}</label>
                    {field.type === "textarea" ? (
                      <textarea
                        value={fieldValues[field.key] || ""}
                        onChange={(e) => updateFieldValue(field.key, e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 min-h-[80px]"
                      />
                    ) : (
                      <input
                        type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
                        value={fieldValues[field.key] || ""}
                        onChange={(e) => updateFieldValue(field.key, e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                      />
                    )}
                  </div>
                ))}

                {flowType === "invoice" && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-gray-700">Line Items</label>
                      <button onClick={addLineItem} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700">
                        <Plus size={12} /> Add
                      </button>
                    </div>
                    <div className="space-y-3">
                      {lineItems.map((item, i) => (
                        <div key={i} className="rounded-lg border border-gray-200 p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-400">#{i + 1}</span>
                            {lineItems.length > 1 && (
                              <button onClick={() => removeLineItem(i)} className="text-gray-400 hover:text-red-500">
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                          <input
                            value={item.description}
                            onChange={(e) => updateLineItem(i, "description", e.target.value)}
                            placeholder="Description"
                            className="w-full rounded border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-indigo-400"
                          />
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateLineItem(i, "quantity", e.target.value)}
                              placeholder="Qty"
                              className="rounded border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-indigo-400"
                            />
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateLineItem(i, "unitPrice", e.target.value)}
                              placeholder="Price"
                              className="rounded border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-indigo-400"
                            />
                            <input
                              type="number"
                              value={item.amount}
                              readOnly
                              placeholder="Amount"
                              className="rounded border border-gray-100 bg-gray-50 px-2 py-1.5 text-xs text-gray-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50 p-5">
            <iframe
              srcDoc={generatePreviewHtml()}
              className="w-full h-full min-h-[500px] rounded-lg border border-gray-200 bg-white"
              title="Document Preview"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
          <button
            onClick={() => {
              if (confirm("Delete this connection?")) {
                onDelete(connection.id);
                onClose();
              }
            }}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleSave} className="rounded-lg bg-indigo px-4 py-2 text-sm font-semibold text-white hover:brightness-110">
              Save document
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
    </AnimatePresence>
  );
}
