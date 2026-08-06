import { apiRequest, requiredEnv, uuid } from "./utils/setup.js"

const body = {
  chain: (process.env.VALIDATOR_CHAIN || "base").toLowerCase(),
  contract_address: requiredEnv("VALIDATOR_POOL_ADDRESS"),
}

console.log("=== Query Validator Pool Rules ===")
await apiRequest("POST", "/validator/rules", body, { requestId: uuid() })
