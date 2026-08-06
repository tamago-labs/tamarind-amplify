import { apiRequest, uuid, type QueryTokensResponse } from "./utils/setup.js"

const body = {
  chain: "monad",
}

console.log("=== 3. Query Supported Tokens ===")
console.log("Listing supported A-Tokens on base chain...\n")

await apiRequest<QueryTokensResponse>("POST", "/query_deposit_atoken_list", body, {
  requestId: uuid(),
})

// === 3. Query Supported Tokens ===
// Listing supported A-Tokens on base chain...

// ▸ POST /query_deposit_atoken_list
// {
//   "code": "0000",
//   "message": "ok",
//   "data": {
//     "chain": "base",
//     "tokens": [
//       {
//         "origin_token": {
//           "address": "0x543b96420d072BF587B63C41C0B0922762E986Ce",
//           "name": "USDC",
//           "symbol": "usdc",
//           "decimals": 6,
//           "icon": "https://images.cleanverse.com/app/token_icon/USDC.svg"
//         },
//         "atoken": {
//           "address": "0xaC0893567D43C3E7e6e35a72803df05416C1f20D",
//           "name": "aUSDC",
//           "symbol": "ausdc",
//           "decimals": 6,
//           "icon": "https://images.cleanverse.com/app/token_icon/A_USDC.svg"
//         },
//         "accesscore_address": "0x8F118338a1fa41E7Fa86Be19A4e8B99Ed58A6EcC",
//         "apass_address": "0xbA82D189540CaC9DC6FF46B6837CaC1BFdEC58B9"
//       },
//       {
//         "origin_token": {
//           "address": "0x3265841087F07F6149D8fe098Fb31EE82bB39724",
//           "name": "Mock ERC20",
//           "symbol": "Org36760",
//           "decimals": 6,
//           "icon": ""
//         },
//         "atoken": {
//           "address": "0xe8885e9363B54b54267240f62B3ddDa7B24E3011",
//           "name": "Access Org36760",
//           "symbol": "WAPTEST",
//           "decimals": 6,
//           "icon": ""
//         },
//         "accesscore_address": "0x8F118338a1fa41E7Fa86Be19A4e8B99Ed58A6EcC",
//         "apass_address": "0xbA82D189540CaC9DC6FF46B6837CaC1BFdEC58B9"
//       },
//       {
//         "origin_token": {
//           "address": "0xb074C1df4ea123183aC8C6BAc8AB74D38A61eB2D",
//           "name": "LUSDC",
//           "symbol": "lUSDC",
//           "decimals": 6,
//           "icon": ""
//         },
//         "atoken": {
//           "address": "0x752f2dC4d759b53b5784Eb78B6BbeAd41c3c02B0",
//           "name": "LUSDC",
//           "symbol": "lUSDC",
//           "decimals": 6,
//           "icon": "https://cleanverse.s3.ap-southeast-1.amazonaws.com/app/images/2026/03/31/5e9618076de548be9bd66dfc2ab32f87.png"
//         },
//         "accesscore_address": "0x8F118338a1fa41E7Fa86Be19A4e8B99Ed58A6EcC",
//         "apass_address": "0xbA82D189540CaC9DC6FF46B6837CaC1BFdEC58B9"
//       },
//       {
//         "origin_token": {
//           "address": "0x9b05228f298825b59E548967bfF2C149c656F594",
//           "name": "GLASS",
//           "symbol": "G",
//           "decimals": 16,
//           "icon": "https://cleanverse.s3.ap-southeast-1.amazonaws.com/app/images/2026/04/01/fca8abfe61984e57a5d3fdcea327f318.jpg"
//         },
//         "atoken": {
//           "address": "0x1B6C328a69b1dC412F4228b182d0DfD813B1f2dB",
//           "name": "aGlass",
//           "symbol": "aG",
//           "decimals": 16,
//           "icon": "https://cleanverse.s3.ap-southeast-1.amazonaws.com/app/images/2026/04/01/f6d007f161414fad8c23f67c23f466d3.jpg"
//         },
//         "accesscore_address": "0x8F118338a1fa41E7Fa86Be19A4e8B99Ed58A6EcC",
//         "apass_address": "0xbA82D189540CaC9DC6FF46B6837CaC1BFdEC58B9"
//       },
//       {
//         "origin_token": {
//           "address": "0x090e7c1dccaa7a9eb624b374ce0113d1dcf83412",
//           "name": "Origin Mock",
//           "symbol": "ORG68095",
//           "decimals": 6,
//           "icon": "https://images.cleanverse.com/app/token_icon/USDC.svg"
//         },
//         "atoken": {
//           "address": "0xe45766A97108f9A7bFb73A5747a0AE19b9D6580f",
//           "name": "Access Token",
//           "symbol": "WAP84460",
//           "decimals": 6,
//           "icon": "https://images.cleanverse.com/app/token_icon/USDC.svg"
//         },
//         "accesscore_address": "0x8F118338a1fa41E7Fa86Be19A4e8B99Ed58A6EcC",
//         "apass_address": "0xbA82D189540CaC9DC6FF46B6837CaC1BFdEC58B9"
//       },
//       {
//         "origin_token": {
//           "address": "0xbb0066cfb65c1a507aba9ffea6bc4991102a2797",
//           "name": "Origin Mock",
//           "symbol": "ORG78568",
//           "decimals": 6,
//           "icon": "https://images.cleanverse.com/app/token_icon/USDC.svg"
//         },
//         "atoken": {
//           "address": "0x7118d75fa5c7b0f9acb1726160f7077b7f351e4e",
//           "name": "Test AToken",
//           "symbol": "TT76727",
//           "decimals": 6,
//           "icon": "https://images.cleanverse.com/app/token_icon/USDC.svg"
//         },
//         "accesscore_address": "0x8F118338a1fa41E7Fa86Be19A4e8B99Ed58A6EcC",
//         "apass_address": "0xbA82D189540CaC9DC6FF46B6837CaC1BFdEC58B9"
//       },
//       {
//         "origin_token": {
//           "address": "0x57d437ef286a8f3d1c2c5de675aa96c1501d710c",
//           "name": "Origin Mock",
//           "symbol": "ORG76174",
//           "decimals": 6,
//           "icon": "https://images.cleanverse.com/app/token_icon/USDC.svg"
//         },
//         "atoken": {
//           "address": "0x88bf2a32a33ae8fb56d728a11f50e431ca234f38",
//           "name": "Test AToken",
//           "symbol": "TT79795",
//           "decimals": 6,
//           "icon": "https://images.cleanverse.com/app/token_icon/USDC.svg"
//         },
//         "accesscore_address": "0x8F118338a1fa41E7Fa86Be19A4e8B99Ed58A6EcC",
//         "apass_address": "0xbA82D189540CaC9DC6FF46B6837CaC1BFdEC58B9"
//       },
//       {
//         "origin_token": {
//           "address": "0x27f2a1D1BCAa435bC1a7e9d8915a84EA17D6265d",
//           "name": "ccc",
//           "symbol": "ccc",
//           "decimals": 12,
//           "icon": "https://cleanverse.s3.ap-southeast-1.amazonaws.com/app/images/2026/04/03/7690454a1d974485900749a86da9c944.png"
//         },
//         "atoken": {
//           "address": "0xbBbA0b5AB85AB8971F45fE1DF779DAB597655BaF",
//           "name": "warp cc",
//           "symbol": "warpcc",
//           "decimals": 12,
//           "icon": "https://cleanverse.s3.ap-southeast-1.amazonaws.com/app/images/2026/04/03/42df48845cc44a6981130a7112bab404.png"
//         },
//         "accesscore_address": "0x8F118338a1fa41E7Fa86Be19A4e8B99Ed58A6EcC",
//         "apass_address": "0xbA82D189540CaC9DC6FF46B6837CaC1BFdEC58B9"
//       },
//       {
//         "origin_token": {
//           "address": "0x25713107e0bc95f06dd8747bbaf3331cff216f51",
//           "name": "Origin Mock",
//           "symbol": "ORG42339",
//           "decimals": 6,
//           "icon": "https://images.cleanverse.com/app/token_icon/USDC.svg"
//         },
//         "atoken": {
//           "address": "0xdf691c7cAE99d0D3c3Dce391F45bB13072Bd29B2",
//           "name": "Access Token",
//           "symbol": "WAP8837",
//           "decimals": 6,
//           "icon": "https://images.cleanverse.com/app/token_icon/USDC.svg"
//         },
//         "accesscore_address": "0x8F118338a1fa41E7Fa86Be19A4e8B99Ed58A6EcC",
//         "apass_address": "0xbA82D189540CaC9DC6FF46B6837CaC1BFdEC58B9"
//       },
//       {
//         "origin_token": {
//           "address": "0x8996eb45404ee713bd60c5156b150e65d80d41a4",
//           "name": "Origin Mock",
//           "symbol": "ORG26768",
//           "decimals": 6,
//           "icon": "https://images.cleanverse.com/app/token_icon/USDC.svg"
//         },
//         "atoken": {
//           "address": "0x259311092c888cac7d83080c92679061fa9890b4",
//           "name": "Test AToken",
//           "symbol": "TT44621",
//           "decimals": 6,
//           "icon": "https://images.cleanverse.com/app/token_icon/USDC.svg"
//         },
//         "accesscore_address": "0x8F118338a1fa41E7Fa86Be19A4e8B99Ed58A6EcC",
//         "apass_address": "0xbA82D189540CaC9DC6FF46B6837CaC1BFdEC58B9"
//       },
//       {
//         "origin_token": {
//           "address": "0x90a9BA2B902f753E38effBF269FA61B783d0DBAC",
//           "name": "Origin Mock",
//           "symbol": "ORG10438",
//           "decimals": 6,
//           "icon": "https://images.cleanverse.com/app/token_icon/USDC.svg"
//         },
//         "atoken": {
//           "address": "0x2fC28aFa54A949450a49c48515c794f2503a381D",
//           "name": "Test AToken",
//           "symbol": "TT55641",
//           "decimals": 6,
//           "icon": "https://images.cleanverse.com/app/token_icon/USDC.svg"
//         },
//         "accesscore_address": "0x8F118338a1fa41E7Fa86Be19A4e8B99Ed58A6EcC",
//         "apass_address": "0xbA82D189540CaC9DC6FF46B6837CaC1BFdEC58B9"
//       },
//       {
//         "origin_token": {
//           "address": "0xD8adeeCc027854000A06f1B961a3A33fd83e9119",
//           "name": "HShaosi",
//           "symbol": "HSUUUDT",
//           "decimals": 6,
//           "icon": "https://example.com/origin.png"
//         },
//         "atoken": {
//           "address": "0xB366Fd782896164aBB649eEcbF617624A16970D5",
//           "name": "HSTT1",
//           "symbol": "HSTT1",
//           "decimals": 6,
//           "icon": "https://example.com/icon.png"
//         },
//         "accesscore_address": "0x8F118338a1fa41E7Fa86Be19A4e8B99Ed58A6EcC",
//         "apass_address": "0xbA82D189540CaC9DC6FF46B6837CaC1BFdEC58B9"
//       },
//       {
//         "origin_token": {
//           "address": "0xa9fc452040977ea5b19b46239aa6400cb2fceff5",
//           "name": "RG-HSTOKEN",
//           "symbol": "HSRGT",
//           "decimals": 6,
//           "icon": "https://example.com/origin.png"
//         },
//         "atoken": {
//           "address": "0xda894cc3c53362a7126200125bd5309ca0fad531",
//           "name": "Test AToken",
//           "symbol": "TT54964",
//           "decimals": 6,
//           "icon": "https://example.com/atoken.png"
//         },
//         "accesscore_address": "0x8F118338a1fa41E7Fa86Be19A4e8B99Ed58A6EcC",
//         "apass_address": "0xbA82D189540CaC9DC6FF46B6837CaC1BFdEC58B9"
//       },
//       {
//         "origin_token": {
//           "address": "0x29bcefe7e4b9e7aa40d2d1afa35190affd286589",
//           "name": "HSERC01",
//           "symbol": "HSWRAP01",
//           "decimals": 6,
//           "icon": "https://example.com/origin.png"
//         },
//         "atoken": {
//           "address": "0x7728Ac88829F7A3B1947E64ffee56eB6F7De0cf3",
//           "name": "HSTT2",
//           "symbol": "HSTT2",
//           "decimals": 6,
//           "icon": "https://example.com/icon.png"
//         },
//         "accesscore_address": "0x8F118338a1fa41E7Fa86Be19A4e8B99Ed58A6EcC",
//         "apass_address": "0xbA82D189540CaC9DC6FF46B6837CaC1BFdEC58B9"
//       },
//       {
//         "origin_token": {
//           "address": "0x18Ae362a86908C3d82ff52500D329eabBced797e",
//           "name": "TestUSD",
//           "symbol": "TUSD",
//           "decimals": 18,
//           "icon": ""
//         },
//         "atoken": {
//           "address": "0x8c1D2f6F4036C37F1eA7A99c62B122059D4a5486",
//           "name": "WrappedTestUSD",
//           "symbol": "WTUSD",
//           "decimals": 18,
//           "icon": ""
//         },
//         "accesscore_address": "0x8F118338a1fa41E7Fa86Be19A4e8B99Ed58A6EcC",
//         "apass_address": "0xbA82D189540CaC9DC6FF46B6837CaC1BFdEC58B9"
//       },
//       {
//         "origin_token": {
//           "address": "0xC81898B9A72D0483aaf881c5923ddbfac53F00A8",
//           "name": "CES",
//           "symbol": "CES",
//           "decimals": 6,
//           "icon": "https://cleanverse.s3.ap-southeast-1.amazonaws.com/app/images/2026/05/13/1754ce14dffa4c5faa1d0899c5e648db.svg"
//         },
//         "atoken": {
//           "address": "0xaFE6091e88d0b18B5c8a08972bA984d7964395b9",
//           "name": "WSEC",
//           "symbol": "WSEC",
//           "decimals": 6,
//           "icon": "https://cleanverse.s3.ap-southeast-1.amazonaws.com/app/images/2026/05/13/2bd6c1ea9d664a3bbd78556f881387a1.svg"
//         },
//         "accesscore_address": "0x8F118338a1fa41E7Fa86Be19A4e8B99Ed58A6EcC",
//         "apass_address": "0xbA82D189540CaC9DC6FF46B6837CaC1BFdEC58B9"
//       },
//       {
//         "origin_token": {
//           "address": "0xd6d3c3e3f27ee8eabea6123050f862b5d4bd269c",
//           "name": "Origin Mock",
//           "symbol": "ORG53045",
//           "decimals": 6,
//           "icon": "https://images.cleanverse.com/app/token_icon/USDC.svg"
//         },
//         "atoken": {
//           "address": "0xb154fF616EC1e31A169fe27650E87F766FdA9F8f",
//           "name": "Access Token",
//           "symbol": "WAP77223",
//           "decimals": 6,
//           "icon": "https://images.cleanverse.com/app/token_icon/USDC.svg"
//         },
//         "accesscore_address": "0x8F118338a1fa41E7Fa86Be19A4e8B99Ed58A6EcC",
//         "apass_address": "0xbA82D189540CaC9DC6FF46B6837CaC1BFdEC58B9"
//       },
//       {
//         "origin_token": {
//           "address": "0x444ab5f90c79e5d5c3b9c52c6de79cbf760fae86",
//           "name": "Origin Mock",
//           "symbol": "ORG48973",
//           "decimals": 6,
//           "icon": "https://images.cleanverse.com/app/token_icon/USDC.svg"
//         },
//         "atoken": {
//           "address": "0xb31d990e05b74bc9096636d34583e54db5b3b25e",
//           "name": "Test AToken",
//           "symbol": "TT72963",
//           "decimals": 6,
//           "icon": "https://images.cleanverse.com/app/token_icon/USDC.svg"
//         },
//         "accesscore_address": "0x8F118338a1fa41E7Fa86Be19A4e8B99Ed58A6EcC",
//         "apass_address": "0xbA82D189540CaC9DC6FF46B6837CaC1BFdEC58B9"
//       },
//       {
//         "origin_token": {
//           "address": "0x2740fdfd7eb26085424b2b79ac28992691645c82",
//           "name": "Origin Mock",
//           "symbol": "OR644448",
//           "decimals": 6,
//           "icon": "https://images.cleanverse.com/app/token_icon/USDC.svg"
//         },
//         "atoken": {
//           "address": "0x504a34499D967169bb1f16d52d3cd8CAE9AB3F80",
//           "name": "AutoApprove Wrapped",
//           "symbol": "LW14685623",
//           "decimals": 6,
//           "icon": "https://images.cleanverse.com/app/token_icon/USDC.svg"
//         },
//         "accesscore_address": "0x8F118338a1fa41E7Fa86Be19A4e8B99Ed58A6EcC",
//         "apass_address": "0xbA82D189540CaC9DC6FF46B6837CaC1BFdEC58B9"
//       },
//       {
//         "origin_token": {
//           "address": "0x5580ed660551da375cba248f02a6106897b3df92",
//           "name": "Origin Mock",
//           "symbol": "OR794975",
//           "decimals": 6,
//           "icon": "https://images.cleanverse.com/app/token_icon/USDC.svg"
//         },
//         "atoken": {
//           "address": "0xf8cefc601f171cc76fd6ecf42078138ee0df8a4c",
//           "name": "Reg Test AToken",
//           "symbol": "RT809094",
//           "decimals": 6,
//           "icon": "https://images.cleanverse.com/app/token_icon/USDC.svg"
//         },
//         "accesscore_address": "0x8F118338a1fa41E7Fa86Be19A4e8B99Ed58A6EcC",
//         "apass_address": "0xbA82D189540CaC9DC6FF46B6837CaC1BFdEC58B9"
//       },
//       {
//         "origin_token": {
//           "address": "0xe0da6390f19fd79b125b5b19eee162033ba65d56",
//           "name": "CleanRail RUSDC",
//           "symbol": "RUSDC625474",
//           "decimals": 6,
//           "icon": "https://images.cleanverse.com/app/token_icon/USDC.svg"
//         },
//         "atoken": {
//           "address": "0x7e9A1A0D5761CffE3E1aD7e0dfA7740F69889114",
//           "name": "Test Wrapped RUSDC",
//           "symbol": "TESTRW3652",
//           "decimals": 6,
//           "icon": "https://images.cleanverse.com/app/token_icon/USDC.svg"
//         },
//         "accesscore_address": "0x8F118338a1fa41E7Fa86Be19A4e8B99Ed58A6EcC",
//         "apass_address": "0xbA82D189540CaC9DC6FF46B6837CaC1BFdEC58B9"
//       },
//       {
//         "origin_token": {
//           "address": "0x01878c31ee73a7c1fe9b8db948c1d4f2022100aa",
//           "name": "CleanRail RUSDC",
//           "symbol": "RUSDC628332",
//           "decimals": 6,
//           "icon": "https://images.cleanverse.com/app/token_icon/USDC.svg"
//         },
//         "atoken": {
//           "address": "0x410F96B402e6F07522dC70c3E76C972A7373006e",
//           "name": "CleanRail Wrapped RUSDC",
//           "symbol": "RUSDCW4316",
//           "decimals": 6,
//           "icon": "https://images.cleanverse.com/app/token_icon/USDC.svg"
//         },
//         "accesscore_address": "0x8F118338a1fa41E7Fa86Be19A4e8B99Ed58A6EcC",
//         "apass_address": "0xbA82D189540CaC9DC6FF46B6837CaC1BFdEC58B9"
//       }
//     ]
//   }
// }