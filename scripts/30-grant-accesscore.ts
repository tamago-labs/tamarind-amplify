import { ethers } from "ethers"
import { fileURLToPath } from "url"
import { dirname, resolve } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

process.loadEnvFile(resolve(__dirname, ".env"))

// ── Config ────────────────────────────────────────────────────
const PRIVATE_KEY = process.env.PRIVATE_KEY!
const RPC_URL = process.env.RPC_URL || "https://sepolia.base.org"
const AJPYC_ADDRESS = "0xE91425E3C244AeE3CD940eca7548CFF010b20828" // aJPYC on Base
const ACCESSCORE_ADDRESS = "0x8F118338a1fa41E7Fa86Be19A4e8B99Ed58A6EcC"

// ── Minimal ABI ───────────────────────────────────────────────
const ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function hasRole(bytes32, address) view returns (bool)",
  "function grantRole(bytes32, address)",
  "function mint(address to, uint256 amount)",
  "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
]

// ── MINTER_ROLE = keccak256("MINTER_ROLE") ───────────────────
const MINTER_ROLE = ethers.id("MINTER_ROLE")

// ── Parse CLI args ────────────────────────────────────────────
const [,, action, ...args] = process.argv

async function info() {
  const provider = new ethers.JsonRpcProvider(RPC_URL)
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
  const token = new ethers.Contract(AJPYC_ADDRESS, ABI, wallet)

  console.log("=== aJPYC Token Info ===\n")
  console.log("Contract:", AJPYC_ADDRESS)
  console.log("Network:", RPC_URL)
  console.log("Admin:", wallet.address)
  console.log()

  const [name, symbol, decimals, totalSupply] = await Promise.all([
    token.name(),
    token.symbol(),
    token.decimals(),
    token.totalSupply(),
  ])

  console.log("Name:", name)
  console.log("Symbol:", symbol)
  console.log("Decimals:", Number(decimals))
  console.log("Total Supply:", ethers.formatUnits(totalSupply, decimals))
  console.log()

  const hasMinter = await token.hasRole(MINTER_ROLE, wallet.address)
  console.log("Admin has MINTER_ROLE:", hasMinter)

  const hasAccessCoreMinter = await token.hasRole(MINTER_ROLE, ACCESSCORE_ADDRESS)
  console.log("AccessCore has MINTER_ROLE:", hasAccessCoreMinter)
}

async function grantAccessCore() {
  const provider = new ethers.JsonRpcProvider(RPC_URL)
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
  const token = new ethers.Contract(AJPYC_ADDRESS, ABI, wallet)

  console.log("=== Grant MINTER_ROLE to AccessCore ===\n")
  console.log("Token:", AJPYC_ADDRESS)
  console.log("AccessCore:", ACCESSCORE_ADDRESS)
  console.log("Admin:", wallet.address)
  console.log()

  // Check if already has role
  const hasRole = await token.hasRole(MINTER_ROLE, ACCESSCORE_ADDRESS)
  if (hasRole) {
    console.log("AccessCore already has MINTER_ROLE!")
    return
  }

  const tx = await token.grantRole(MINTER_ROLE, ACCESSCORE_ADDRESS)
  console.log("TX sent:", tx.hash)
  const receipt = await tx.wait()
  console.log("Confirmed in block:", receipt.blockNumber)
  console.log()

  const hasRoleAfter = await token.hasRole(MINTER_ROLE, ACCESSCORE_ADDRESS)
  console.log("MINTER_ROLE granted:", hasRoleAfter)
}

async function mint(toAddress: string, amount: string) {
  const provider = new ethers.JsonRpcProvider(RPC_URL)
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
  const token = new ethers.Contract(AJPYC_ADDRESS, ABI, wallet)

  console.log("=== Mint aJPYC ===\n")
  console.log("Token:", AJPYC_ADDRESS)
  console.log("To:", toAddress)
  console.log("Amount:", amount)
  console.log()

  // Check MINTER_ROLE
  const hasMinter = await token.hasRole(MINTER_ROLE, wallet.address)
  if (!hasMinter) {
    console.log("ERROR: Admin wallet does not have MINTER_ROLE")
    console.log("Run: npm run 18-mint-atoken -- grant-accesscore")
    process.exit(1)
  }

  const mintAmount = ethers.parseUnits(amount, 18)
  const tx = await token.mint(toAddress, mintAmount)
  console.log("TX sent:", tx.hash)
  const receipt = await tx.wait()
  console.log("Confirmed in block:", receipt.blockNumber)

  const balance = await token.balanceOf(toAddress)
  console.log()
  console.log("Recipient balance:", ethers.formatUnits(balance, 18), "aJPYC")
}

// ── Main ──────────────────────────────────────────────────────
console.log()

if (action === "info") {
  await info()
} else if (action === "grant-accesscore") {
  await grantAccessCore()
} else if (action === "mint") {
  if (!args[0] || !args[1]) {
    console.log("Usage: npm run 18-mint-atoken -- mint <toAddress> <amount>")
    process.exit(1)
  }
  await mint(args[0], args[1])
} else {
  console.log("aJPYC Minting Tool\n")
  console.log("Commands:")
  console.log("  npm run 18-mint-atoken -- info")
  console.log("    Show token info and role status\n")
  console.log("  npm run 18-mint-atoken -- grant-accesscore")
  console.log("    Grant MINTER_ROLE to AccessCore contract\n")
  console.log("  npm run 18-mint-atoken -- mint <toAddress> <amount>")
  console.log("    Mint tokens to a wallet\n")
  console.log("Examples:")
  console.log("  npm run 18-mint-atoken -- info")
  console.log("  npm run 18-mint-atoken -- grant-accesscore")
  console.log("  npm run 18-mint-atoken -- mint 0x888895E314B...... 1000")
}
