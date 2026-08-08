import { ethers } from "ethers"
import { fileURLToPath } from "url"
import { dirname, resolve } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

process.loadEnvFile(resolve(__dirname, ".env"))

// ── Config ────────────────────────────────────────────────────
const PRIVATE_KEY = process.env.PRIVATE_KEY!
// const RPC_URL = process.env.RPC_URL || "https://sepolia.base.org"
const RPC_URL = "https://testnet-rpc.monad.xyz"
// const TOKEN_ADDRESS = "0x89a21fAEE4FAf7E8d3d95e7d1236b81dB1FFA48b"
const TOKEN_ADDRESS = "0x89D4513154277359343B959043A4886f646521d7"
const DECIMALS = 6

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
  "event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
]

// ── MINTER_ROLE = keccak256("MINTER_ROLE") ───────────────────
const MINTER_ROLE = ethers.id("MINTER_ROLE")

// ── Parse CLI args ────────────────────────────────────────────
const [,, action, ...args] = process.argv

async function info() {
  const provider = new ethers.JsonRpcProvider(RPC_URL)
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
  const token = new ethers.Contract(TOKEN_ADDRESS, ABI, wallet)

  console.log("=== A-Token Info ===\n")
  console.log("Contract:", TOKEN_ADDRESS)
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
}

async function grantMinter(minterAddress: string) {
  const provider = new ethers.JsonRpcProvider(RPC_URL)
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
  const token = new ethers.Contract(TOKEN_ADDRESS, ABI, wallet)

  console.log("=== Grant MINTER_ROLE ===\n")
  console.log("Token:", TOKEN_ADDRESS)
  console.log("Minter:", minterAddress)
  console.log("Admin:", wallet.address)
  console.log()

  const tx = await token.grantRole(MINTER_ROLE, minterAddress)
  console.log("TX sent:", tx.hash)
  const receipt = await tx.wait()
  console.log("Confirmed in block:", receipt.blockNumber)
  console.log()

  const hasMinter = await token.hasRole(MINTER_ROLE, minterAddress)
  console.log("MINTER_ROLE granted:", hasMinter)
}

async function mint(toAddress: string, amount: string) {
  const provider = new ethers.JsonRpcProvider(RPC_URL)
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
  const token = new ethers.Contract(TOKEN_ADDRESS, ABI, wallet)

  console.log("=== Mint A-Token ===\n")
  console.log("Token:", TOKEN_ADDRESS)
  console.log("To:", toAddress)
  console.log("Amount:", amount)
  console.log()

  // Check MINTER_ROLE
  const hasMinter = await token.hasRole(MINTER_ROLE, wallet.address)
  if (!hasMinter) {
    console.log("ERROR: Admin wallet does not have MINTER_ROLE")
    console.log("Run: npm run 18-mint-atoken -- grant <minterAddress>")
    process.exit(1)
  }

  const mintAmount = ethers.parseUnits(amount, DECIMALS)
  const tx = await token.mint(toAddress, mintAmount)
  console.log("TX sent:", tx.hash)
  const receipt = await tx.wait()
  console.log("Confirmed in block:", receipt.blockNumber)

  const balance = await token.balanceOf(toAddress)
  console.log()
  console.log("Recipient balance:", ethers.formatUnits(balance, DECIMALS), "TRT004")
}

// ── Main ──────────────────────────────────────────────────────
console.log()

if (action === "info") {
  await info()
} else if (action === "grant") {
  if (!args[0]) {
    console.log("Usage: npm run 18-mint-atoken -- grant <minterAddress>")
    process.exit(1)
  }
  await grantMinter(args[0])
} else if (action === "mint") {
  if (!args[0] || !args[1]) {
    console.log("Usage: npm run 18-mint-atoken -- mint <toAddress> <amount>")
    process.exit(1)
  }
  await mint(args[0], args[1])
} else {
  console.log("A-Token Minting Tool\n")
  console.log("Commands:")
  console.log("  npm run 18-mint-atoken -- info")
  console.log("    Show token info and admin role status\n")
  console.log("  npm run 18-mint-atoken -- grant <minterAddress>")
  console.log("    Grant MINTER_ROLE to a wallet\n")
  console.log("  npm run 18-mint-atoken -- mint <toAddress> <amount>")
  console.log("    Mint tokens to a wallet\n")
  console.log("Examples:")
  console.log("  npm run 18-mint-atoken -- info")
  console.log("  npm run 18-mint-atoken -- grant 0x888895E314B......")
  console.log("  npm run 18-mint-atoken -- mint 0x888895E314B...... 1000")
}
