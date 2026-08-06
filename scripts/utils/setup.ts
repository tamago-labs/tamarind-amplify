import crypto from "crypto"
import { fileURLToPath } from "url"
import { dirname, resolve } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

process.loadEnvFile(resolve(__dirname, "../.env"))

// ── Credentials ───────────────────────────────────────────────
export const API_ID = process.env.CLEANVERSE_API_ID!
export const API_KEY = process.env.CLEANVERSE_API_KEY!
export const BASE_URL = process.env.CLEANVERSE_BASE_URL!

// ── Types ─────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  code: string
  message: string
  data: T
}

export interface Wallet {
  address: string
  chain: string
}

export interface IdentityData {
  idType: "ID_CARD" | "PASSPORT" | "DRIVER_LICENSE" | "HK_MACAO_TAIWAN_PASS" | "RESIDENCE_PERMIT"
  fullName: string
  idNumber?: string
  validUntil?: string
  issuingCountryISO2: string
}

export interface BankAccount {
  bankCountry: string
  bankName: string
  bankAccount?: string
  bankAccountType?: "C" | "D" | "A"
  balance?: number
  currency?: string
}

export interface GenerateAPassBody {
  customerId: string
  kycSource?: string
  kycId?: string
  subTier?: number
  subGroup?: string
  override?: boolean
  expirationTime: number
  wallet: Wallet
  identityDataList?: IdentityData[]
  bankAccountList?: BankAccount[]
}

export interface GenerateAPassResponse {
  customerId: string
  cvRecordId: string
  tier: string
  wallet: {
    operate: string
    address: string
    chain: string
    txHash: string
    depositUSDCWallet: string
    depositUSDCAccount: string
    depositUSDTWallet: string
    depositUSDTAccount: string
    apassAddress: string
  }
}

export interface QueryAPassResponse {
  cvRecordId: string
  subTier: number
  tier: string
  status: number
  expirationTime: number
  subGroup: string
  currentKycHash: string
  group: string
  countries: string[]
}

export interface QueryAPassListResponse {
  total: number
  page: number
  pageSize: number
  items: Array<{
    cvRecordId: string
    customerId: string
    chain: string
    walletAddress: string
    status: number
    tier: string
    subTier: number
    group: string
    subGroup: string
    countries: string[]
    expirationTime: number
    txHash: string
    registeredAt: string
  }>
}

export interface TokenInfo {
  address: string
  name: string
  symbol: string
  decimals: number
  icon: string
}

export interface QueryTokensResponse {
  chain: string
  tokens: Array<{
    origin_token: TokenInfo
    atoken: TokenInfo
    accesscore_address: string
    apass_address: string
  }>
}

export interface ComplianceRule {
  allowed_group: string
  allowed_sub_group: string
  min_tier: number
  min_sub_tier: number
  is_black_list: boolean
  countries: string[]
}

export function requiredEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

export function validatorRuleFromEnv(): ComplianceRule {
  return {
    allowed_group: process.env.VALIDATOR_ALLOWED_GROUP || "",
    allowed_sub_group: process.env.VALIDATOR_ALLOWED_SUB_GROUP || "",
    min_tier: Number(process.env.VALIDATOR_MIN_TIER || "0"),
    min_sub_tier: Number(process.env.VALIDATOR_MIN_SUB_TIER || "0"),
    is_black_list: process.env.VALIDATOR_COUNTRY_BLACKLIST === "true",
    countries: (process.env.VALIDATOR_COUNTRIES || "").split(",").map((country) => country.trim().toUpperCase()).filter(Boolean),
  }
}

export interface LaunchATokenBody {
  chain: string
  token_name: string
  token_symbol: string
  decimals: number
  admin_address: string
  rule: ComplianceRule
  icon: string
  callback_url?: string
}

export interface LaunchATokenResponse {
  requestId: string
  issueAssetId: number
}

export interface QueryApplyStatusResponse {
  flowType: string
  requestId: string
  applyStatus: string
  chain: string
  atokenAddress: string
  originTokenAddress?: string
  tokenSymbol: string
  txHash: string
  issuedAt: string
  rejectReason?: string
  issueErrorMsg?: string
}

export interface ListATokensResponse {
  total: number
  page: number
  pageSize: number
  items: Array<{
    flowType: string
    requestId: string
    applyStatus: string
    chain: string
    atokenAddress: string
    originTokenAddress?: string
    tokenSymbol: string
    tokenName: string
    txHash: string
    issuedAt: string
    createTime: string
  }>
}

export interface AddRuleBody {
  chain: string
  atoken_address: string
  rule: ComplianceRule
}

export interface QueryRulesResponse {
  chain: string
  atoken_address: string
  rules: ComplianceRule[]
}

export interface FaucetBody {
  chain: string
  symbol: string
  depositAddress: string
  amount: string
}

export interface FaucetResponse {
  chain: string
  symbol: string
  deposit_address: string
  amount: string
  tx_hash: string
}

export interface VerifyAPassBody {
  chain: string
  atoken: string
  address: string
}

export interface VerifyAPassResponse {
  chain: string
  atoken: string
  address: string
  code: number
  message: string
  magickLink?: string
}

export interface UpdateStatusBody {
  customerId?: string
  cvRecordId?: string
  status: "1" | "2"
  blacklistReason?: string
  wallet: Wallet
}

export interface UpdateStatusResponse {
  txHash: string
}

export interface QueryDepositAddressBody {
  chain: string
  address: string
}

export interface QueryDepositAddressResponse {
  address: string
  chain: string
  txHash: string | null
  depositUSDCWallet: string
  depositUSDTWallet: string
  apassAddress: string
}

export interface QueryTransactionsBody {
  chain: string
  address: string
  symbol?: string
  startTime?: number
  endTime?: number
  txHash?: string
  type?: string
  page?: number
  pageSize?: number
}

export interface Transaction {
  chain: string
  symbol: string
  tx_hash: string
  from_address: string
  from_org_name: string
  to_address: string
  amount: string
  fee_amount: string
  pay_fee_index: number
  type: string
  block_number: number
  block_time: number
  status: string
}

export interface QueryTransactionsResponse {
  total_count: number
  txs: Transaction[]
}

export interface DownloadTravelRuleBody {
  customerId?: string
  cvRecordId?: string
  txHash: string
  wallet: Wallet
}

export interface DownloadTravelRuleResponse {
  downloadUrl: string
  fileName: string
}

export interface SetATokenPausedBody {
  chain: string
  atoken_address: string
  paused: boolean
}

export interface SetATokenPausedResponse {
  chain: string
  paused: boolean
  atoken_address: string
  tx_hash: string
}

export interface QueryATokenPausedBody {
  chain: string
  atoken_address: string
}

export interface QueryATokenPausedResponse {
  chain: string
  paused: boolean
  atoken_address: string
}

// ── AES Encryption ────────────────────────────────────────────
const IV = Buffer.alloc(16, 0)

export function encrypt(plaintext: object): string {
  const key = Buffer.from(API_KEY, "base64")
  const cipher = crypto.createCipheriv("aes-256-cbc", key, IV)
  const encrypted = cipher.update(JSON.stringify(plaintext), "utf8")
  return Buffer.concat([encrypted, cipher.final()]).toString("base64")
}

export function decrypt<T = unknown>(base64Ciphertext: string): T {
  const key = Buffer.from(API_KEY, "base64")
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, IV)
  const decrypted = decipher.update(Buffer.from(base64Ciphertext, "base64"))
  return JSON.parse(Buffer.concat([decrypted, decipher.final()]).toString("utf8")) as T
}

// ── API Request Helper ────────────────────────────────────────
export async function apiRequest<T = unknown>(
  method: "GET" | "POST",
  path: string,
  body?: object,
  { encrypted = false, requestId }: { encrypted?: boolean; requestId?: string } = {}
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${path}`
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "api-id": API_ID,
  }
  if (requestId) headers["X-Request-ID"] = requestId

  const payload = encrypted && body ? { data: encrypt(body) } : body

  const res = await fetch(url, {
    method,
    headers,
    body: payload ? JSON.stringify(payload) : undefined,
  })

  const json = (await res.json()) as ApiResponse<T>
  console.log(`\n\u25B8 ${method} ${path}`)
  console.log(JSON.stringify(json, null, 2))
  return json
}

// ── UUID generator ────────────────────────────────────────────
export function uuid(): string {
  return crypto.randomUUID()
}
