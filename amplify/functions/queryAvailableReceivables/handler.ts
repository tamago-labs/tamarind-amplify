import type { Schema } from "../../data/resource.js";
import { Amplify } from "aws-amplify";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { generateClient } from "aws-amplify/data";
import { env } from "$amplify/env/queryAvailableReceivables";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export async function handler(
  event: Schema["queryAvailableReceivablesOp"]["functionHandler"]
): Promise<{ success: boolean; receivables?: any[]; error?: string }> {
  const { workspaceId } = event.arguments;
  console.log("queryAvailableReceivables:", { workspaceId });

  try {
    const receivablesResult = await client.models.Receivable.list({
      filter: {
        and: [
          { workspaceId: { eq: workspaceId } },
          { status: { eq: "funding" } },
        ],
      },
    });

    const receivables = await Promise.all(
      (receivablesResult.data || []).map(async (r) => {
        const proofsResult = await client.models.ReceivableProof.list({
          filter: { receivableId: { eq: r.id } },
        });
        return { ...r, proofs: proofsResult.data || [] };
      })
    );

    return { success: true, receivables };
  } catch (error) {
    console.error("queryAvailableReceivables error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
