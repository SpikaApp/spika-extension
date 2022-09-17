import { AptosClient, TokenClient, FaucetClient } from "aptos";
import { NODE_URL, FAUCET_URL } from "../utils/constants";
import { CONFIGS } from "@manahippo/hippo-sdk";
export const client = new AptosClient(NODE_URL);

export const tokenClient = new TokenClient(client);

export const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL, null);

export const hippoClient = () => {
  const isDevnet = true;
  const netConf = isDevnet ? CONFIGS.devnet : CONFIGS.localhost;
  return netConf;
};
