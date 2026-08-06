import { apiRequest, requiredEnv, uuid } from "./utils/setup.js"

const paused = process.env.VALIDATOR_PAUSED === "true"
const body = {
  chain: (process.env.VALIDATOR_CHAIN || "base").toLowerCase(),
  contract_address: requiredEnv("VALIDATOR_POOL_ADDRESS"),
  paused,
}

console.log("=== Set Validator Pool Pause State ===")
console.log("Paused:", paused)
await apiRequest("POST", "/validator/set_paused", body, { encrypted: true, requestId: uuid() })
