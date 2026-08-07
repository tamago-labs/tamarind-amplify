import { apiRequest, uuid } from "./utils/setup.js"

const body = {
  chain: "base",
}

console.log("=== Query Institution Whitelist ===\n")
console.log("Chain:", body.chain)
console.log()

await apiRequest("POST", "/query_institution_white_list", body, {
  requestId: uuid(),
})
