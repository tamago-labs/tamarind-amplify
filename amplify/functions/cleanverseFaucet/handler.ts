import crypto from "node:crypto";
import type { Schema } from "../../data/resource.js";
import { Amplify } from "aws-amplify";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { generateClient } from "aws-amplify/data";
import { env } from "$amplify/env/cleanverseFaucet";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

const API_ID = env.CLEANVERSE_API_ID;
const BASE_URL = env.CLEANVERSE_BASE_URL;

function uuid(): string {
  return crypto.randomUUID();
}

export async function handler(
  event: Schema["cleanverseFaucet"]["functionHandler"]
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  console.log("Lambda received event.arguments:", JSON.stringify(event.arguments));
  const { chain, depositAddress, amount } = event.arguments;
  console.log("Extracted values:", { chain, depositAddress, amount });

  try {
    const body = {
      InstitutionFaucetReq: {
        Chain: chain,
        Symbol: "usdc",
        DepositAddress: depositAddress,
        Amount: amount || "5",
      }
    };
    console.log("Request body:", JSON.stringify(body));

    const url = `${BASE_URL}/faucet`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "api-id": API_ID,
      "X-Request-ID": uuid(),
    };

    console.log("Sending request to:", url);
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
        txHash: json.data.tx_hash,
      };
    } else {
      return {
        success: false,
        error: json.message || "Faucet request failed",
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
