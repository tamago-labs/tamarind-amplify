import { apiRequest, requiredEnv, uuid } from "./utils/setup.js"

const body = {
  chain: (process.env.VALIDATOR_CHAIN || "base").toLowerCase(),
  contract_address: requiredEnv("VALIDATOR_POOL_ADDRESS"),
}

console.log("=== Query Validator Pool Pause State ===")
await apiRequest("POST", "/validator/is_paused", body, { requestId: uuid() })
