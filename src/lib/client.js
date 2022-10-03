import { AptosClient, TokenClient, FaucetClient } from "aptos";
import { getStore } from "../lib/store";
import { NODE_URL, FAUCET_URL, PLATFORM } from "../utils/constants";
import { CONFIGS } from "@manahippo/hippo-sdk";

const _currentNetwork = "currentNetwork";

class SpikaClient {
  constructor(nodeUrl, faucetUrl) {
    this.client = new AptosClient(nodeUrl);
    this.tokenClient = new TokenClient(new AptosClient(nodeUrl));
    this.faucetClient = new FaucetClient(nodeUrl, faucetUrl, null);
  }
}

export const client = new AptosClient(NODE_URL);

export const tokenClient = new TokenClient(client);

export const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL, null);

export const spikaClient = async () => {
  const network = await getStore(PLATFORM, _currentNetwork);
  if (!network) {
    return new SpikaClient(NODE_URL, FAUCET_URL);
  } else {
    return new SpikaClient(network.data.node_url, network.data.faucet_url);
  }
};

export const hippoClient = () => {
  const isDevnet = true;
  const netConf = isDevnet ? CONFIGS.devnet : CONFIGS.localhost;
  return netConf;
};
