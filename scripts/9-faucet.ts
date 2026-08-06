import { apiRequest, uuid, type FaucetBody, type FaucetResponse } from "./utils/setup.js"

const body: FaucetBody = {
  chain: "base",
  symbol: "usdc",
  depositAddress: "0x971F6680a20671458d456656081ea8e32102a64e",
  amount: "100",
}

console.log("=== 9. Faucet ===")
console.log(`Requesting ${body.amount} ${body.symbol.toUpperCase()} to ${body.depositAddress}...\n`)

await apiRequest<FaucetResponse>("POST", "/faucet", body, {
  requestId: uuid(),
})
