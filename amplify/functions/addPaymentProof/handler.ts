import type { Schema } from "../../data/resource.js";
import { Amplify } from "aws-amplify";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { generateClient } from "aws-amplify/data";
import { env } from "$amplify/env/addPaymentProof";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export async function handler(
  event: Schema["addPaymentProofOp"]["functionHandler"]
): Promise<{ success: boolean; error?: string }> {
  const { workspaceId, receivableId, proofId, merkleRoot, description } = event.arguments;
  console.log("addPaymentProof:", { workspaceId, receivableId, proofId });

  try {
    const receivableResult = await client.models.Receivable.get({ id: receivableId });
    if (!receivableResult.data) {
      return { success: false, error: "Receivable not found" };
    }

    const receivable = receivableResult.data;
    if (receivable.workspaceId !== workspaceId) {
      return { success: false, error: "Access denied" };
    }

    if (receivable.status !== "created") {
      return { success: false, error: `Cannot add proof: status is ${receivable.status}` };
    }

    await client.models.ReceivableProof.create({
      receivableId,
      proofId,
      merkleRoot,
      description: description || null,
      attachedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error("addPaymentProof error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
