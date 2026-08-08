import type { Schema } from "../../data/resource.js";
import { Amplify } from "aws-amplify";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { generateClient } from "aws-amplify/data";
import { env } from "$amplify/env/createReceivable";
import { createPublicClient } from "../../../lib/receivableChain.js";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export async function handler(
  event: Schema["createReceivableOp"]["functionHandler"]
): Promise<{ success: boolean; managerAddress?: string; nftAddress?: string; error?: string }> {
  const { workspaceId, workflowRunId, fundingTarget, repaymentAmount, dueDate, interestRate, rule, paymentProofs } = event.arguments;

  try {
    const identity = await client.auth.getIdentityId();
    if (!identity.data) {
      return { success: false, error: "Not authenticated" };
    }

    const chainId = 84532;
    const publicClient = createPublicClient(chainId);

    const factoryAddress = env.RECEIVABLE_FACTORY_ADDRESS as `0x${string}`;
    const fundingTargetWei = BigInt(fundingTarget);
    const repaymentAmountWei = BigInt(repaymentAmount);
    const dueAt = Math.floor(new Date(dueDate).getTime() / 1000);

    const ruleData = rule ? {
      allowedGroup: (rule as any).allowed_group || "0x0000",
      allowedSubGroup: (rule as any).allowed_sub_group || "0x0000",
      minTier: (rule as any).min_tier || 0,
      minSubTier: (rule as any).min_sub_tier || 0,
      poolCountryBitmap: BigInt((rule as any).pool_country_bitmap || 0),
    } : {
      allowedGroup: "0x0000",
      allowedSubGroup: "0x0000",
      minTier: 0,
      minSubTier: 0,
      poolCountryBitmap: BigInt(0),
    };

    return { success: false, error: "On-chain transaction required from frontend" };
  } catch (error) {
    console.error("createReceivable error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
