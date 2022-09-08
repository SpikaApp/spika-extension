import aptos_light from "../assets/aptos_light.png";
import aptos_dark from "../assets/aptos_dark.png";

const coin = [
  {
    type: "0x1::aptos_coin::AptosCoin",
    data: {
      name: "AptosCoin",
      symbol: "APT",
      decimals: 8,
      logo: aptos_light,
      logo_alt: aptos_dark,
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

export default coin;
