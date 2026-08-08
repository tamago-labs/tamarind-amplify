import type { Schema } from "../../data/resource.js";
import { Amplify } from "aws-amplify";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { generateClient } from "aws-amplify/data";
import { env } from "$amplify/env/openFunding";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

export async function handler(
  event: Schema["openFundingOp"]["functionHandler"]
): Promise<{ success: boolean; error?: string }> {
  const { workspaceId, receivableId } = event.arguments;
  console.log("openFunding:", { workspaceId, receivableId });

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
      return { success: false, error: `Cannot open funding: status is ${receivable.status}` };
    }

    return { success: false, error: "On-chain transaction required from frontend" };
  } catch (error) {
    console.error("openFunding error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
