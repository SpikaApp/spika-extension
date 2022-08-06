export const tokenStore = {
  address: "0x3",
  module: "token",
  name: "TokenStore",
  generic_type_params: [],
};

export const AptosCoin = [
  {
    name: "AptosCoin",
    ticker: "APTOS",
  },
  {
    address: "0x1",
    module: "coin",
    name: "CoinStore",
    generic_type_params: ["0x1::aptos_coin::AptosCoin"],
  },
];
