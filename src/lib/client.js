import { AptosClient, TokenClient, FaucetClient } from "aptos";
import { getStore } from "../lib/store";
import { NODE_URL, FAUCET_URL, PLATFORM } from "../utils/constants";
import { CONFIGS } from "@manahippo/hippo-sdk";
import { networkList } from "./network";

const _currentNetwork = "currentNetwork";

class SpikaClient {
  constructor(network) {
    this.client = new AptosClient(network.data.node_url);
    this.tokenClient = new TokenClient(new AptosClient(network.data.node_url));
    if (network.data.testnet) {
      this.faucetClient = new FaucetClient(network.data.node_url, network.data.faucet_url, null);
    }
  }
}

export const client = new AptosClient(NODE_URL);
export const tokenClient = new TokenClient(client);
export const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL, null);

export const spikaClient = async (network) => {
  let _network;
  if (network) {
    _network = network;
  } else {
    _network = await getStore(PLATFORM, _currentNetwork);
  }
  return new SpikaClient(_network ? _network : networkList[0]);
};

export const hippoClient = () => {
  const isTestnet = true;
  const netConf = isTestnet ? CONFIGS.testnet : CONFIGS.localhost;
  return netConf;
};
