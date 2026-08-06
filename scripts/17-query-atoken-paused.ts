import { apiRequest, uuid, type QueryATokenPausedBody, type QueryATokenPausedResponse } from "./utils/setup.js"

const body: QueryATokenPausedBody = {
  chain: "base",
  atoken_address: "0x89a21faee4faf7e8d3d95e7d1236b81db1ffa48b",
}

console.log("=== 17. Query A-Token Paused State ===")
console.log(`Checking pause state for ${body.atoken_address}...\n`)

await apiRequest<QueryATokenPausedResponse>("POST", "/atoken/is_paused", body, {
  requestId: uuid(),
})
