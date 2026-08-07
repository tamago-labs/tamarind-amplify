import crypto from "crypto";
import type { Schema } from "../../data/resource.js";

interface FaucetBody {
  chain: string;
  symbol: string;
  depositAddress: string;
  amount: string;
}

interface FaucetResponse {
  chain: string;
  symbol: string;
  deposit_address: string;
  amount: string;
  tx_hash: string;
}

const API_ID = process.env.CLEANVERSE_API_ID!;
const API_KEY = process.env.CLEANVERSE_API_KEY!;
const BASE_URL = process.env.CLEANVERSE_BASE_URL!;

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
  event: Schema["cleanverseFaucet"]["functionHandler"]
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  const { chain, depositAddress, amount } = event.arguments;

  try {
    const body: FaucetBody = {
      chain,
      symbol: "usdc",
      depositAddress,
      amount: amount || "5",
    };

    const url = `${BASE_URL}/faucet`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "api-id": API_ID,
      "X-Request-ID": uuid(),
    };

    const payload = { data: encrypt(body) };

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const json = (await res.json()) as { code: string; message: string; data: FaucetResponse };

    if (json.code === "0" || json.code === "200") {
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
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
