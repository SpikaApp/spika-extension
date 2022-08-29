import { AptosClient, TokenClient, FaucetClient } from "aptos";
import { NODE_URL, FAUCET_URL } from "../utils/constants";

export const client = new AptosClient(NODE_URL);
export const tokenClient = new TokenClient(client);
export const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL, null);
