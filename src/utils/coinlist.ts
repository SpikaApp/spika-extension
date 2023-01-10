import { ICoin } from "../interface";
import { dexClient } from "../core/client";

import aptos_light from "../assets/aptos_light.png";
import aptos_dark from "../assets/aptos_dark.png";

export const fetchCoinlist = (nodeUrl: string): ICoin[] => {
  const client = dexClient(nodeUrl, "Mainnet");
  const data = client.coinListClient.coinList;
  const coinlist: ICoin[] = [];
  data.map((coin) => {
    const result: ICoin = {
      type: coin.token_type.type,
      data: {
        name: coin.name,
        symbol: coin.symbol,
        decimals: coin.decimals,
        logo: coin.name === "Aptos Coin" ? aptos_light : coin.logo_url,
        logo_alt: coin.name === "Aptos Coin" ? aptos_dark : coin.logo_url,
        swap: true,
      },
    };
    coinlist.push(result);
  });
  return coinlist;
};
