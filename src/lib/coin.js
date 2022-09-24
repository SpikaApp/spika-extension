import aptos_light from "../assets/aptos_light.png";
import aptos_dark from "../assets/aptos_dark.png";
// import argo_usd from "../assets/argo_usd.svg";

export const aptosCoin = {
  type: "0x1::aptos_coin::AptosCoin",
  data: {
    name: "Aptos Coin",
    symbol: "APT",
    decimals: 8,
    logo: aptos_light,
    logo_alt: aptos_dark,
    swap: false,
  },
};

export const coinList = [
  {
    type: "0x1::aptos_coin::AptosCoin",
    data: {
      name: "Aptos Coin",
      symbol: "APT",
      decimals: 8,
      logo: aptos_light,
      logo_alt: aptos_dark,
      swap: false,
    },
  },
  {
    type: "0x498d8926f16eb9ca90cab1b3a26aa6f97a080b3fcbe6e83ae150b7243a00fb68::devnet_coins::DevnetUSDT",
    data: {
      name: "Tether",
      symbol: "USDT",
      decimals: 8,
      logo: "https://assets.coingecko.com/coins/images/325/small/Tether-logo.png?1598003707",
      logo_alt: "https://assets.coingecko.com/coins/images/325/small/Tether-logo.png?1598003707",
      swap: true,
    },
  },
  {
    type: "0x498d8926f16eb9ca90cab1b3a26aa6f97a080b3fcbe6e83ae150b7243a00fb68::devnet_coins::DevnetUSDC",
    data: {
      name: "USD Coin",
      symbol: "USDC",
      decimals: 8,
      logo: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1547042389",
      logo_alt: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1547042389",
      swap: true,
    },
  },
  {
    type: "0x498d8926f16eb9ca90cab1b3a26aa6f97a080b3fcbe6e83ae150b7243a00fb68::devnet_coins::DevnetDAI",
    data: {
      name: "Dai",
      symbol: "DAI",
      decimals: 8,
      logo: "https://assets.coingecko.com/coins/images/9956/small/4943.png?1636636734",
      logo_alt: "https://assets.coingecko.com/coins/images/9956/small/4943.png?1636636734",
      swap: true,
    },
  },
  {
    type: "0x498d8926f16eb9ca90cab1b3a26aa6f97a080b3fcbe6e83ae150b7243a00fb68::devnet_coins::DevnetBTC",
    data: {
      name: "Bitcoin",
      symbol: "BTC",
      decimals: 8,
      logo: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png?1547033579",
      logo_alt: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png?1547033579",
      swap: true,
    },
  },
  {
    type: "0x498d8926f16eb9ca90cab1b3a26aa6f97a080b3fcbe6e83ae150b7243a00fb68::devnet_coins::DevnetETH",
    data: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 8,
      logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880",
      logo_alt: "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880",
      swap: false,
    },
  },
  {
    type: "0x498d8926f16eb9ca90cab1b3a26aa6f97a080b3fcbe6e83ae150b7243a00fb68::devnet_coins::DevnetSOL",
    data: {
      name: "Solana",
      symbol: "SOL",
      decimals: 8,
      logo: "https://assets.coingecko.com/coins/images/4128/small/solana.png?1640133422",
      logo_alt: "https://assets.coingecko.com/coins/images/4128/small/solana.png?1640133422",
      swap: true,
    },
  },
  {
    type: "0x498d8926f16eb9ca90cab1b3a26aa6f97a080b3fcbe6e83ae150b7243a00fb68::devnet_coins::DevnetBNB",
    data: {
      name: "BNB",
      symbol: "BNB",
      decimals: 8,
      logo: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png?1644979850",
      logo_alt: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png?1644979850",
      swap: false,
    },
  },
  // {
  //   type: "0x1000000f373eb95323f8f73af0e324427ca579541e3b70c0df15c493c72171aa::usda::USDA",
  //   data: {
  //     name: "Argo USD",
  //     symbol: "USDA",
  //     decimals: 6,
  //     logo: argo_usd,
  //     logo_alt: argo_usd,
  //     swap: false,
  //   },
  // },
];

export const coinStore = (type) => {
  const data = `0x1::coin::CoinStore<${type}>`;
  return data;
};

export const coinInfo = (type) => {
  const data = `0x1::coin::CoinInfo<${type}>`;
  return data;
};
