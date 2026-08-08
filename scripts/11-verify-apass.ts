import { apiRequest, uuid, type VerifyAPassBody, type VerifyAPassResponse } from "./utils/setup.js"

const body: VerifyAPassBody = {
  chain: "base",
  atoken: "0xE91425E3C244AeE3CD940eca7548CFF010b20828",
  address: "0x971F6680a20671458d456656081ea8e32102a64e",
}

console.log("=== 11. Verify A-Pass ===")
console.log("Checking if user can receive/transfer token...\n")
console.log("Token:", body.atoken)
console.log("User:", body.address, "\n")

const res = await apiRequest<VerifyAPassResponse>("POST", "/verify_apass", body, {
  requestId: uuid(),
})

if (res.code === "0000" && res.data) {
  const codes: Record<number, string> = {
    1: "AToken not found",
    2: "User does not have APass",
    3: "APass exists but cannot transfer (expired or frozen)",
    4: "Success — user has valid APass and transfer is allowed",
  }
  console.log("\n  Verification:", codes[res.data.code] ?? `Unknown code ${res.data.code}`)
}

// === 11. Verify A-Pass ===
// Checking if user can receive/transfer token...

// Token: 0x04345ceFdD9AAaAFBD7d04C240c761BbB1884553
// User: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0


// ▸ POST /verify_apass
// {
//   "code": "0000",
//   "message": "ok",
//   "data": {
//     "chain": "base",
//     "atoken": "0x04345ceFdD9AAaAFBD7d04C240c761BbB1884553",
//     "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
//     "code": 4,
//     "message": "apass verify success",
//     "magickLink": "https://test-magiclink.cleanverse.com/"
//   }
// }

//   Verification: Success — user has valid APass and transfer is allowed