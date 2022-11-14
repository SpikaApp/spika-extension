import { ICoin } from "../interface";
import aptos_light from "../assets/aptos_light.png";
import aptos_dark from "../assets/aptos_dark.png";

export const aptosCoin: ICoin = {
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

export const coinList: Array<ICoin> = [
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
];

export const coinStore = (type: string): string => {
  return `0x1::coin::CoinStore<${type}>`;
};

export const coinInfo = (type: string): string => {
  return `0x1::coin::CoinInfo<${type}>`;
};
