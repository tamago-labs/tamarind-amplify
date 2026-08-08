import type { Schema } from "../../data/resource.js";
import { Amplify } from "aws-amplify";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { generateClient } from "aws-amplify/data";
import { env } from "$amplify/env/createReceivable";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export async function handler(
  event: Schema["createReceivableOp"]["functionHandler"]
): Promise<{ success: boolean; managerAddress?: string; nftAddress?: string; error?: string }> {
  const { workspaceId, fundingTarget, repaymentAmount, dueDate, interestRate, rule, paymentProofs } = event.arguments;
  console.log("createReceivable:", { workspaceId, fundingTarget, repaymentAmount, dueDate });

  try {
    return { success: false, error: "On-chain transaction required from frontend" };
  } catch (error) {
    console.error("createReceivable error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
