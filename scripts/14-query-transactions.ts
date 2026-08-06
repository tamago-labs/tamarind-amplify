import { apiRequest, uuid, type QueryTransactionsBody, type QueryTransactionsResponse } from "./utils/setup.js"

const body: QueryTransactionsBody = {
  chain: "base",
  address: "0x971F6680a20671458d456656081ea8e32102a64e",
  symbol: "TRT001",
  page: 1,
  pageSize: 20,
}

console.log("=== 14. Query Transactions ===")
console.log(`Fetching transactions for ${body.address}...\n`)

await apiRequest<QueryTransactionsResponse>("POST", "/query_txs", body, {
  requestId: uuid(),
})
