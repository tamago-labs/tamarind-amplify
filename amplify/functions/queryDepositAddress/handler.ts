import crypto from "node:crypto";
import type { Schema } from "../../data/resource.js";
import { Amplify } from "aws-amplify";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { generateClient } from "aws-amplify/data";
import { env } from "$amplify/env/queryDepositAddress";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

const API_ID = env.CLEANVERSE_API_ID;
const BASE_URL = env.CLEANVERSE_BASE_URL;

function uuid(): string {
  return crypto.randomUUID();
}

export async function handler(
  event: Schema["queryDepositAddress"]["functionHandler"]
): Promise<{ success: boolean; depositAddress?: string; error?: string }> {
  const { chain, address } = event.arguments;
  console.log("Query deposit address:", { chain, address });

  try {
    const url = `${BASE_URL}/query_deposit_address`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "api-id": API_ID,
      "X-Request-ID": uuid(),
    };

    const body = { chain, address };

    console.log("Sending to:", url);
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const responseText = await res.text();
    console.log("Raw response:", responseText);
    const json = JSON.parse(responseText);
    console.log("Parsed response:", JSON.stringify(json));

    if (json.code === "0000" || json.code === "0" || json.code === "200") {
      return {
        success: true,
        depositAddress: json.data.depositUSDCWallet,
      };
    } else {
      return {
        success: false,
        error: json.message || "Failed to get deposit address",
      };
    }
  } catch (error) {
    console.error("Lambda error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
