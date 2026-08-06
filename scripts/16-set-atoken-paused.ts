import { apiRequest, uuid, type SetATokenPausedBody, type SetATokenPausedResponse } from "./utils/setup.js"

const body: SetATokenPausedBody = {
  chain: "base",
  atoken_address: "0x89a21faee4faf7e8d3d95e7d1236b81db1ffa48b",
  paused: true,
}

console.log("=== 16. Set A-Token Paused ===")
console.log(`Setting token ${body.atoken_address} paused=${body.paused}...\n`)

await apiRequest<SetATokenPausedResponse>("POST", "/atoken/set_paused", body, {
  encrypted: true,
  requestId: uuid(),
})
