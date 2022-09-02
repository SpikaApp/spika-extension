import aptos_light from "../assets/aptos_light.png";
import aptos_dark from "../assets/aptos_dark.png";

export const aptosCoin = {
  id: "aptosCoin",
  name: "AptosCoin",
  ticker: "APT",
  logo_light: aptos_light,
  logo_dark: aptos_dark,
  module: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
  TypeTagStruct: "0x1::aptos_coin::AptosCoin",
};

export const tokenStore = {
  module: "0x3::token::TokenStore",
};

export const coinTransferFunction = "0x1::coin::transfer";
