import { apiRequest, uuid, type QueryATokenPausedBody, type QueryATokenPausedResponse } from "./utils/setup.js"

const body: QueryATokenPausedBody = {
  chain: "base",
  atoken_address: "0xaC0893567D43C3E7e6e35a72803df05416C1f20D",
}

console.log("=== 17. Query A-Token Paused State ===")
console.log(`Checking pause state for ${body.atoken_address}...\n`)

await apiRequest<QueryATokenPausedResponse>("POST", "/atoken/is_paused", body, {
  requestId: uuid(),
})
