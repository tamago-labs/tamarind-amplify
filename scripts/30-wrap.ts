import { ethers } from "ethers"
import { fileURLToPath } from "url"
import { dirname, resolve } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

process.loadEnvFile(resolve(__dirname, ".env"))

// ── Config ────────────────────────────────────────────────────
const PRIVATE_KEY = process.env.PRIVATE_KEY!
const RPC_URL = process.env.RPC_URL || "https://sepolia.base.org"

// Token addresses for Base
const ORIGIN_TOKEN = "0x543b96420d072BF587B63C41C0B0922762E986Ce" // USDC
const ATOKEN = "0xaC0893567D43C3E7e6e35a72803df05416C1f20D" // aUSDC
const ACCESSCORE = "0x8F118338a1fa41E7Fa86Be19A4e8B99Ed58A6EcC"

const DECIMALS = 6

// ── ABIs ──────────────────────────────────────────────────────
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
]

const ACCESSCORE_ABI = [
  "function deposit(address from, address collateral, uint256 amount, address to) returns (uint256)",
  "function withdraw(address token, uint256 assets, address receiver) returns (uint256)",
]

// ── Parse CLI args ────────────────────────────────────────────
const [,, action, ...args] = process.argv

async function info() {
  const provider = new ethers.JsonRpcProvider(RPC_URL)
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
  const usdc = new ethers.Contract(ORIGIN_TOKEN, ERC20_ABI, wallet)
  const ausdc = new ethers.Contract(ATOKEN, ERC20_ABI, wallet)

  console.log("=== Token Info ===\n")
  console.log("Wallet:", wallet.address)
  console.log("Network:", RPC_URL)
  console.log()

  const [usdcBalance, ausdcBalance, allowance] = await Promise.all([
    usdc.balanceOf(wallet.address),
    ausdc.balanceOf(wallet.address),
    usdc.allowance(wallet.address, ACCESSCORE),
  ])

  console.log("USDC Balance:", ethers.formatUnits(usdcBalance, DECIMALS))
  console.log("aUSDC Balance:", ethers.formatUnits(ausdcBalance, DECIMALS))
  console.log("USDC Allowance for AccessCore:", ethers.formatUnits(allowance, DECIMALS))
}

async function wrap(amount: string) {
  const provider = new ethers.JsonRpcProvider(RPC_URL)
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
  const usdc = new ethers.Contract(ORIGIN_TOKEN, ERC20_ABI, wallet)
  const accesscore = new ethers.Contract(ACCESSCORE, ACCESSCORE_ABI, wallet)

  console.log("=== Wrap USDC → aUSDC ===\n")
  console.log("Amount:", amount, "USDC")
  console.log("From:", wallet.address)
  console.log()

  const amountWei = ethers.parseUnits(amount, DECIMALS)

  // Check balance
  const balance = await usdc.balanceOf(wallet.address)
  if (balance < amountWei) {
    console.log("ERROR: Insufficient USDC balance")
    console.log("Balance:", ethers.formatUnits(balance, DECIMALS))
    process.exit(1)
  }

  // Step 1: Approve
  console.log("Step 1: Approving USDC for AccessCore...")
  const approveTx = await usdc.approve(ACCESSCORE, amountWei)
  console.log("TX sent:", approveTx.hash)
  await approveTx.wait()
  console.log("Approved ✓")
  console.log()

  // Step 2: Deposit (wrap)
  // deposit(from, collateral, amount, to)
  console.log("Step 2: Depositing USDC to AccessCore...")
  const depositTx = await accesscore.deposit(ORIGIN_TOKEN, ATOKEN, amountWei, wallet.address)
  console.log("TX sent:", depositTx.hash)
  await depositTx.wait()
  console.log("Deposited ✓")
  console.log()

  // Check new balance
  const newBalance = await ausdc.balanceOf(wallet.address)
  console.log("New aUSDC Balance:", ethers.formatUnits(newBalance, DECIMALS))
}

async function unwrap(amount: string) {
  const provider = new ethers.JsonRpcProvider(RPC_URL)
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
  const ausdc = new ethers.Contract(ATOKEN, ERC20_ABI, wallet)
  const accesscore = new ethers.Contract(ACCESSCORE, ACCESSCORE_ABI, wallet)

  console.log("=== Unwrap aUSDC → USDC ===\n")
  console.log("Amount:", amount, "aUSDC")
  console.log("From:", wallet.address)
  console.log()

  const amountWei = ethers.parseUnits(amount, DECIMALS)

  // Check balance
  const balance = await ausdc.balanceOf(wallet.address)
  if (balance < amountWei) {
    console.log("ERROR: Insufficient aUSDC balance")
    console.log("Balance:", ethers.formatUnits(balance, DECIMALS))
    process.exit(1)
  }

  // Step 1: Approve
  console.log("Step 1: Approving aUSDC for AccessCore...")
  const approveTx = await ausdc.approve(ACCESSCORE, amountWei)
  console.log("TX sent:", approveTx.hash)
  await approveTx.wait()
  console.log("Approved ✓")
  console.log()

  // Step 2: Withdraw (unwrap)
  console.log("Step 2: Withdrawing aUSDC from AccessCore...")
  const withdrawTx = await accesscore.withdraw(ATOKEN, amountWei, wallet.address)
  console.log("TX sent:", withdrawTx.hash)
  await withdrawTx.wait()
  console.log("Withdrawn ✓")
  console.log()

  // Check new balance
  const newBalance = await ausdc.balanceOf(wallet.address)
  console.log("New aUSDC Balance:", ethers.formatUnits(newBalance, DECIMALS))
}

// ── Main ──────────────────────────────────────────────────────
console.log()

if (action === "info") {
  await info()
} else if (action === "wrap") {
  if (!args[0]) {
    console.log("Usage: npm run wrap -- <amount>")
    console.log("Example: npm run wrap -- 10")
    process.exit(1)
  }
  await wrap(args[0])
} else if (action === "unwrap") {
  if (!args[0]) {
    console.log("Usage: npm run unwrap -- <amount>")
    console.log("Example: npm run unwrap -- 5")
    process.exit(1)
  }
  await unwrap(args[0])
} else {
  console.log("Wrap/Unwrap Tool\n")
  console.log("Commands:")
  console.log("  npm run 30-wrap -- info")
  console.log("    Show token balances and allowance\n")
  console.log("  npm run 30-wrap -- wrap <amount>")
  console.log("    Wrap USDC to aUSDC\n")
  console.log("  npm run 30-wrap -- unwrap <amount>")
  console.log("    Unwrap aUSDC to USDC\n")
  console.log("Examples:")
  console.log("  npm run 30-wrap -- info")
  console.log("  npm run 30-wrap -- wrap 10")
  console.log("  npm run 30-wrap -- unwrap 5")
}
