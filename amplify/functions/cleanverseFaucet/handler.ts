import crypto from "crypto";
import type { Schema } from "../../data/resource.js";

interface FaucetBody {
  Chain: string;
  Symbol: string;
  DepositAddress: string;
  Amount: string;
}

interface FaucetResponse {
  chain: string;
  symbol: string;
  deposit_address: string;
  amount: string;
  tx_hash: string;
}

const API_ID = process.env.CLEANVERSE_API_ID!;
const BASE_URL = process.env.CLEANVERSE_BASE_URL!;

function uuid(): string {
  return crypto.randomUUID();
}

export async function handler(
  event: Schema["cleanverseFaucet"]["functionHandler"]
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  const { chain, depositAddress, amount } = event.arguments;

  try {
    const body: FaucetBody = {
      Chain: chain,
      Symbol: "usdc",
      DepositAddress: depositAddress,
      Amount: amount || "5",
    };

    const url = `${BASE_URL}/faucet`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "api-id": API_ID,
      "X-Request-ID": uuid(),
    };

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const json = (await res.json()) as { code: string; message: string; data: FaucetResponse };

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
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
