import crypto from "node:crypto";
import type { Schema } from "../../data/resource.js";
import { Amplify } from "aws-amplify";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { generateClient } from "aws-amplify/data";
import { env } from "$amplify/env/addWhitelist";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

const API_ID = env.CLEANVERSE_API_ID;
const API_KEY = env.CLEANVERSE_API_KEY;
const BASE_URL = env.CLEANVERSE_BASE_URL;

const IV = Buffer.alloc(16, 0);

function encrypt(plaintext: object): string {
  const key = Buffer.from(API_KEY, "base64");
  const cipher = crypto.createCipheriv("aes-256-cbc", key, IV);
  const encrypted = cipher.update(JSON.stringify(plaintext), "utf8");
  return Buffer.concat([encrypted, cipher.final()]).toString("base64");
}

function uuid(): string {
  return crypto.randomUUID();
}

export async function handler(
  event: Schema["addWhitelist"]["functionHandler"]
): Promise<{ success: boolean; error?: string }> {
  const { chain, tokenAddress, tokenSymbol, walletAddresses } = event.arguments;
  console.log("Add whitelist:", { chain, tokenAddress, tokenSymbol, walletAddresses });

  try {
    const body = {
      entityName: "Tamago Labs",
      serviceName: "Tamarind",
      category: "DeFi",
      license: "TAMARIND-2026",
      logoUrl: "https://avatars.githubusercontent.com/u/169526695",
      addressList: [
        {
          chain,
          symbol: tokenSymbol.toLowerCase(),
          assetAddress: tokenAddress,
          walletAddresses: walletAddresses || [],
        },
      ],
    };

    const url = `${BASE_URL}/atoken/add_whitelist_for_institutional`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "api-id": API_ID,
      "X-Request-ID": uuid(),
    };

    const payload = { data: encrypt(body) };

    console.log("Sending to:", url);
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const responseText = await res.text();
    console.log("Raw response:", responseText);
    const json = JSON.parse(responseText);
    console.log("Parsed response:", JSON.stringify(json));

    if (json.code === "0000" || json.code === "0" || json.code === "200") {
      return { success: true };
    } else {
      return {
        success: false,
        error: json.message || "Failed to add to whitelist",
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
