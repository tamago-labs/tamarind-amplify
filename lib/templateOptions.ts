export type DocumentType = "payment" | "invoice" | "payslip";
export type TemplateFieldType = "text" | "number" | "date" | "currency" | "textarea";
export type TemplateFieldPosition = "header" | "body" | "footer";

export interface TemplateField {
  key: string;
  label: string;
  type: TemplateFieldType;
  required: boolean;
  autoFillKey?: string;
  position: TemplateFieldPosition;
  locked?: boolean;
}

const paymentFields: TemplateField[] = [
  { key: "companyName", label: "Company name", type: "text", required: true, autoFillKey: "companyName", position: "header" },
  { key: "senderName", label: "Sender", type: "text", required: true, autoFillKey: "senderName", position: "body" },
  { key: "recipientName", label: "Recipient", type: "text", required: true, autoFillKey: "recipientName", position: "body" },
  { key: "amount", label: "Amount", type: "currency", required: true, autoFillKey: "amount", position: "body", locked: true },
  { key: "currency", label: "Currency", type: "text", required: true, autoFillKey: "currency", position: "body", locked: true },
  { key: "paymentDate", label: "Payment date", type: "date", required: false, autoFillKey: "paymentDate", position: "body", locked: true },
  { key: "chain", label: "Network", type: "text", required: true, autoFillKey: "chain", position: "footer", locked: true },
  { key: "txHash", label: "Transaction hash", type: "text", required: true, autoFillKey: "txHash", position: "footer", locked: true },
  { key: "settlementId", label: "Settlement ID", type: "text", required: false, autoFillKey: "settlementId", position: "footer" },
  { key: "merkleRoot", label: "Merkle root", type: "text", required: false, autoFillKey: "merkleRoot", position: "footer" },
  { key: "status", label: "Status", type: "text", required: false, autoFillKey: "status", position: "footer" },
  { key: "notes", label: "Notes", type: "textarea", required: false, position: "footer" },
];

const invoiceFields: TemplateField[] = [
  { key: "companyName", label: "Company name", type: "text", required: true, autoFillKey: "companyName", position: "header" },
  { key: "invoiceNumber", label: "Invoice number", type: "text", required: true, autoFillKey: "invoiceNumber", position: "header" },
  { key: "senderName", label: "Sender", type: "text", required: true, autoFillKey: "senderName", position: "body" },
  { key: "recipientName", label: "Recipient", type: "text", required: true, autoFillKey: "recipientName", position: "body" },
  { key: "issueDate", label: "Issue date", type: "date", required: true, autoFillKey: "issueDate", position: "body" },
  { key: "dueDate", label: "Due date", type: "date", required: true, autoFillKey: "dueDate", position: "body" },
  { key: "lineItems", label: "Line items", type: "textarea", required: true, autoFillKey: "lineItems", position: "body" },
  { key: "subtotal", label: "Subtotal", type: "currency", required: false, autoFillKey: "subtotal", position: "body" },
  { key: "tax", label: "Tax", type: "currency", required: false, autoFillKey: "tax", position: "body" },
  { key: "total", label: "Total", type: "currency", required: true, autoFillKey: "total", position: "body" },
  { key: "currency", label: "Currency", type: "text", required: true, autoFillKey: "currency", position: "body", locked: true },
  { key: "approvalStatus", label: "Approval status", type: "text", required: false, autoFillKey: "approvalStatus", position: "footer" },
  { key: "chain", label: "Network", type: "text", required: true, autoFillKey: "chain", position: "footer", locked: true },
  { key: "txHash", label: "Transaction hash", type: "text", required: true, autoFillKey: "txHash", position: "footer", locked: true },
  { key: "settlementId", label: "Settlement ID", type: "text", required: false, autoFillKey: "settlementId", position: "footer" },
  { key: "merkleRoot", label: "Merkle root", type: "text", required: false, autoFillKey: "merkleRoot", position: "footer" },
];

const payslipFields: TemplateField[] = [
  { key: "companyName", label: "Company name", type: "text", required: true, autoFillKey: "companyName", position: "header" },
  { key: "employeeName", label: "Employee", type: "text", required: true, autoFillKey: "employeeName", position: "body" },
  { key: "payPeriod", label: "Pay period", type: "text", required: true, autoFillKey: "payPeriod", position: "body" },
  { key: "grossPay", label: "Gross pay", type: "currency", required: true, autoFillKey: "grossPay", position: "body" },
  { key: "deductions", label: "Deductions", type: "currency", required: false, autoFillKey: "deductions", position: "body" },
  { key: "netPay", label: "Net pay", type: "currency", required: true, autoFillKey: "netPay", position: "body" },
  { key: "currency", label: "Currency", type: "text", required: true, autoFillKey: "currency", position: "body", locked: true },
  { key: "chain", label: "Network", type: "text", required: true, autoFillKey: "chain", position: "footer", locked: true },
  { key: "txHash", label: "Transaction hash", type: "text", required: true, autoFillKey: "txHash", position: "footer", locked: true },
  { key: "settlementId", label: "Settlement ID", type: "text", required: false, autoFillKey: "settlementId", position: "footer" },
  { key: "merkleRoot", label: "Merkle root", type: "text", required: false, autoFillKey: "merkleRoot", position: "footer" },
];

export const fieldsByDocumentType: Record<DocumentType, TemplateField[]> = {
  payment: paymentFields,
  invoice: invoiceFields,
  payslip: payslipFields,
};

export const documentTypes: Array<{ value: DocumentType; label: string }> = [
  { value: "payment", label: "Payment" },
  { value: "invoice", label: "Invoice" },
  { value: "payslip", label: "Payslip" },
];

export function documentTypeLabel(value?: string | null) {
  return documentTypes.find((item) => item.value === value)?.label || "Payment";
}

export function getLockedFields(documentType: DocumentType): TemplateField[] {
  return fieldsByDocumentType[documentType].filter((field) => field.locked);
}

export function getRemovableFields(fields: TemplateField[]): TemplateField[] {
  return fields.filter((field) => !field.locked);
}
