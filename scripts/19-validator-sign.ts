import { Wallet } from "ethers"
import { requiredEnv } from "./utils/setup.js"

const chain = (process.env.VALIDATOR_SIGN_CHAIN || "base").toLowerCase()
const address = requiredEnv("VALIDATOR_SIGN_ADDRESS").toLowerCase()
const privateKey = requiredEnv("PRIVATE_KEY")
const message = `${chain}${address}`
const signature = await new Wallet(privateKey).signMessage(message)

console.log("=== Validator Owner Signature ===")
console.log("Signed message:", message)
console.log("Signature:", signature)
console.log("Use this value as VALIDATOR_OWNER_SIGNATURE for register/grant scripts.")
