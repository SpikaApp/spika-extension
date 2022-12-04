import { ICoin } from "../interface";
import { hippoTradeAggregator } from "../lib/client";

export const fetchCoinlist = async (nodeUrl: string) => {
  const client = hippoTradeAggregator(nodeUrl, "Mainnet");
  const data = client.coinListClient.coinList;
  const coinlist: ICoin[] = [];
  data.map((coin) => {
    const result: ICoin = {
      type: coin.token_type.type,
      data: {
        name: coin.name,
        symbol: coin.symbol,
        decimals: coin.decimals,
        logo: coin.logo_url,
        logo_alt: coin.logo_url,
        swap: true,
      },
    };
    coinlist.push(result);
    return coinlist;
  });
};
