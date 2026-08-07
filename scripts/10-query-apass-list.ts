import { apiRequest, uuid, type QueryAPassListResponse } from "./utils/setup.js"

const PAGE_SIZE = 100

async function fetchAllAPasses() {
  let page = 1
  let allItems: any[] = []
  let total = 0

  console.log("=== 10. Query A-Pass List (All Pages) ===\n")

  do {
    console.log(`Fetching page ${page}...`)

    const response = await apiRequest<QueryAPassListResponse>("POST", "/query_apass_list", {
      page,
      pageSize: PAGE_SIZE,
    }, {
      requestId: uuid(),
    })

    if (response.code !== "0000") {
      console.log("Error:", response.message)
      break
    }

    total = response.data.total
    const items = response.data.items || []
    allItems = allItems.concat(items)

    console.log(`  Got ${items.length} items (total so far: ${allItems.length}/${total})`)

    page++
  } while (allItems.length < total)

  console.log(`\n=== Summary ===`)
  console.log(`Total A-Passes: ${total}`)
  console.log(`Fetched: ${allItems.length}`)
  console.log()

  // Group by chain
  const byChain: Record<string, number> = {}
  for (const item of allItems) {
    byChain[item.chain] = (byChain[item.chain] || 0) + 1
  }
  console.log("By chain:")
  for (const [chain, count] of Object.entries(byChain)) {
    console.log(`  ${chain}: ${count}`)
  }
  console.log()

  // Show first 5 as sample
  console.log("Sample (first 5):")
  for (const item of allItems.slice(0, 5)) {
    console.log(`  ${item.customerId} | ${item.chain} | ${item.walletAddress.slice(0, 10)}... | tier ${item.tier}`)
  }
}

fetchAllAPasses()



