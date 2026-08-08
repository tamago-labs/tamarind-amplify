import type { Schema } from "../../data/resource.js";
import { Amplify } from "aws-amplify";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { generateClient } from "aws-amplify/data";
import { env } from "$amplify/env/queryReceivable";
import { createPublicClient, RECEIVABLE_MANAGER_ABI, RECEIVABLE_STATUS } from "../../../lib/receivableChain.js";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export async function handler(
  event: Schema["queryReceivableOp"]["functionHandler"]
): Promise<{ success: boolean; receivable?: any; error?: string }> {
  const { workspaceId, receivableId } = event.arguments;

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

    const chainId = 84532;
    let onChainData: any = null;

    try {
      const publicClient = createPublicClient(chainId);
      onChainData = await publicClient.readContract({
        address: receivable.managerAddress as `0x${string}`,
        abi: RECEIVABLE_MANAGER_ABI,
        functionName: "getReceivableInfo",
      });
    } catch (e) {
      console.log("Could not read on-chain data:", e);
    }

    return {
      success: true,
      receivable: {
        ...receivable,
        proofs: proofsResult.data || [],
        onChain: onChainData ? {
          totalFunded: onChainData[4]?.toString(),
          proofCount: Number(onChainData[5]),
          status: RECEIVABLE_STATUS[onChainData[6] as keyof typeof RECEIVABLE_STATUS] || "unknown",
        } : null,
      },
    };
  } catch (error) {
    console.error("queryReceivable error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
