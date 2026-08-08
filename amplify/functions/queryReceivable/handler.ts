import type { Schema } from "../../data/resource.js";
import { Amplify } from "aws-amplify";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { generateClient } from "aws-amplify/data";
import { env } from "$amplify/env/queryReceivable";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export async function handler(
  event: Schema["queryReceivableOp"]["functionHandler"]
): Promise<{ success: boolean; receivable?: any; error?: string }> {
  const { workspaceId, receivableId } = event.arguments;
  console.log("queryReceivable:", { workspaceId, receivableId });

  try {
    const receivableResult = await client.models.Receivable.get({ id: receivableId });
    if (!receivableResult.data) {
      return { success: false, error: "Receivable not found" };
    }

    const receivable = receivableResult.data;
    if (receivable.workspaceId !== workspaceId) {
      return { success: false, error: "Access denied" };
    }

    const proofsResult = await client.models.ReceivableProof.list({
      filter: { receivableId: { eq: receivableId } },
    });

    return {
      success: true,
      receivable: {
        ...receivable,
        proofs: proofsResult.data || [],
      },
    };
  } catch (error) {
    console.error("queryReceivable error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
