import type { Schema } from "../../data/resource.js";
import { Amplify } from "aws-amplify";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { generateClient } from "aws-amplify/data";
import { env } from "$amplify/env/queryInvestmentPositions";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export async function handler(
  event: Schema["queryInvestmentPositionsOp"]["functionHandler"]
): Promise<{ success: boolean; positions?: any[]; error?: string }> {
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

    const positionsResult = await client.models.InvestmentPosition.list({
      filter: { receivableId: { eq: receivableId } },
    });

    return {
      success: true,
      positions: positionsResult.data || [],
    };
  } catch (error) {
    console.error("queryInvestmentPositions error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
