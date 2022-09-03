import aptos_light from "../assets/aptos_light.png";
import aptos_dark from "../assets/aptos_dark.png";

const coin = [
  {
    id: "aptosCoin",
    data: {
      name: "AptosCoin",
      symbol: "APT",
      logo_light: aptos_light,
      logo_dark: aptos_dark,
      module: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
      TypeTagStruct: "0x1::aptos_coin::AptosCoin",
    },
  },
];

export default coin;
