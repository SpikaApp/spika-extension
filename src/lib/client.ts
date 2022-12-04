import { AptosClient, TokenClient, FaucetClient } from "aptos";
import { getStore } from "./store";
import { NODE_URL, FAUCET_URL, PLATFORM } from "../utils/constants";
import { CONFIGS, NetworkConfiguration, TradeAggregator } from "@manahippo/hippo-sdk";
import { networkList } from "./accountNetworks";
import { INetwork } from "../interface";

const _currentNetwork = "currentNetwork";

class SpikaClient {
  client: AptosClient;
  tokenClient: TokenClient;
  faucetClient?: FaucetClient;

  constructor(network: INetwork) {
    this.client = new AptosClient(network.data.node_url, { CREDENTIALS: "same-origin", WITH_CREDENTIALS: false });
    this.tokenClient = new TokenClient(new AptosClient(network.data.node_url));
    if (network.data.faucet_url) {
      this.faucetClient = new FaucetClient(network.data.node_url, network.data.faucet_url, undefined);
    }
  }
}

export const client = new AptosClient(NODE_URL);
export const tokenClient = new TokenClient(client);
export const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL, undefined);

export const spikaClient = async (network?: INetwork): Promise<SpikaClient> => {
  let _network: INetwork;
  if (network) {
    _network = network;
  } else {
    _network = await getStore(PLATFORM, _currentNetwork);
  }
  return new SpikaClient(_network ? _network : networkList[0]);
};

export type IHippoClientNetwork = "Mainnet" | "Testnet" | "Local";

export const hippoClient = (network: IHippoClientNetwork): NetworkConfiguration => {
  switch (network) {
    case "Mainnet":
      return CONFIGS.mainnet;
    case "Testnet":
      return CONFIGS.testnet;
    case "Local":
      return CONFIGS.localhost;
  }
};

type IHippoClientConf = "Mainnet" | "Testnet" | "Local";

export const hippoTradeAggregator = (nodeUrl: string, network: IHippoClientConf): TradeAggregator => {
  const client = new AptosClient(nodeUrl, { CREDENTIALS: "same-origin", WITH_CREDENTIALS: false });
  const netConf = hippoClient(network);
  return new TradeAggregator(client, netConf);
};
