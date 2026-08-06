import { apiRequest, uuid, type UpdateStatusBody, type UpdateStatusResponse } from "./utils/setup.js"

const body: UpdateStatusBody = {
  customerId: "TAMARINDUSER003",
  status: "2",
  blacklistReason: "Compliance review failed",
  wallet: {
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
    chain: "base",
  },
}

console.log("=== 12. Update Status (Freeze/Unfreeze A-Pass) ===")
console.log(`Freezing A-Pass for ${body.wallet.address}...\n`)
console.log("Status:", body.status === "1" ? "Activate (unfreeze)" : "Freeze")
console.log("Reason:", body.blacklistReason, "\n")

await apiRequest<UpdateStatusResponse>("POST", "/update_status", body, {
  encrypted: true,
  requestId: uuid(),
})

// === 12. Update Status (Freeze/Unfreeze A-Pass) ===
// Freezing A-Pass for 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0...

// Status: Freeze
// Reason: Compliance review failed


// ▸ POST /update_status
// {
//   "code": "0000",
//   "message": "success",
//   "data": {
//     "txHash": "0xfaa7ef1050e97c642ce866bd857e100c228ac9aff01b9ab34b8c3487618e686c"
//   }
// }