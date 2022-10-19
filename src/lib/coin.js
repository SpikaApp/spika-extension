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
