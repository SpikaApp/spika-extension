import aptos_light from "../assets/aptos_light.png";
import aptos_dark from "../assets/aptos_dark.png";

export const aptosCoin = {
  id: "aptosCoin",
  name: "AptosCoin",
  symbol: "APT",
  logo_light: aptos_light,
  logo_dark: aptos_dark,
  module: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
  TypeTagStruct: "0x1::aptos_coin::AptosCoin",
};

export const devnetTether = {
  id: "devnetTether",
  name: "DevnetUSDT",
  symbol: "USDT",
  logo_light: "https://assets.coingecko.com/coins/images/325/small/Tether-logo.png?1598003707",
  logo_dark: "https://assets.coingecko.com/coins/images/325/small/Tether-logo.png?1598003707",
  module:
    "0x1::coin::CoinStore<0x498d8926f16eb9ca90cab1b3a26aa6f97a080b3fcbe6e83ae150b7243a00fb68::devnet_coins::DevnetUSDT>",
  TypeTagStruct:
    "0x498d8926f16eb9ca90cab1b3a26aa6f97a080b3fcbe6e83ae150b7243a00fb68::devnet_coins::DevnetUSDT",
};

export const tokenStore = {
  module: "0x3::token::TokenStore",
};

export const coinTransferFunction = "0x1::coin::transfer";
