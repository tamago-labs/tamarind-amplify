import crypto from "crypto"
import { API_ID, API_KEY, BASE_URL } from "./utils/setup.js"

console.log("=== Cleanverse Configuration Check ===")
console.log("Base URL:", BASE_URL || "missing")
console.log("API ID:", API_ID ? "configured" : "missing")

if (!API_ID || !API_KEY || !BASE_URL) throw new Error("Set CLEANVERSE_API_ID, CLEANVERSE_API_KEY, and CLEANVERSE_BASE_URL in scripts/.env")

const configuredKey = API_KEY.trim().replace(/^['"]|['"]$/g, "")
const decoded = Buffer.from(configuredKey.replace(/\s/g, ""), "base64")
const raw = Buffer.from(configuredKey, "utf8")
if (decoded.length !== 32 && raw.length !== 32) throw new Error("CLEANVERSE_API_KEY must decode to 32 bytes for AES-256-CBC")

console.log("AES key:", decoded.length === 32 ? "valid Base64 32-byte key" : "valid raw 32-byte key")
console.log("Request ID sample:", crypto.randomUUID())
console.log("[OK] Configuration looks valid")
