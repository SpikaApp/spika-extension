import aptos_light from "../assets/aptos_light.png";
import aptos_dark from "../assets/aptos_dark.png";

export const aptosCoin = {
  type: "0x1::aptos_coin::AptosCoin",
  data: {
    name: "Aptos Coin",
    symbol: "APT",
    decimals: 8,
    logo: aptos_light,
    logo_alt: aptos_dark,
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
    },
  },
];

export const coinStore = (type) => {
  const data = `0x1::coin::CoinStore<${type}>`;
  return data;
};

export const coinInfo = (type) => {
  const data = `0x1::coin::CoinInfo<${type}>`;
  return data;
};
