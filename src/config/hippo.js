import { HexString } from "aptos";

export class NetworkConfiguration {
  constructor(
    name,
    fullNodeUrl,
    faucetUrl,
    hippoDexAddress,
    hippoDexPubkey,
    coinListAddress,
    hippoAggregatorAddress,
    pontemAddress,
    econiaAddress,
    isMainnet = false
  ) {}

  get simulationKeys() {
    return {
      pubkey: this.hippoDexPubkey,
      address: this.hippoDexAddress,
    };
  }
}

export const LOCAL_CONFIG = new NetworkConfiguration(
  "localhost",
  "http://0.0.0.0:8080",
  "http://0.0.0.0:8000",
  // hippo dex
  new HexString("0xa61e1e86e9f596e483283727d2739ba24b919012720648c29380f9cd0a96c11a"),
  new HexString("0x980a2b1bc2c60ae3e7b7cd1f22ee6fa078843a856b86b111c98f7dc744d2d2b4"),
  // coin list
  new HexString("0xa61e1e86e9f596e483283727d2739ba24b919012720648c29380f9cd0a96c11a"),
  // hippo aggregator
  new HexString("0xa61e1e86e9f596e483283727d2739ba24b919012720648c29380f9cd0a96c11a"),
  // pontem
  new HexString("0xa61e1e86e9f596e483283727d2739ba24b919012720648c29380f9cd0a96c11a"),
  // econia
  new HexString("0xa61e1e86e9f596e483283727d2739ba24b919012720648c29380f9cd0a96c11a")
);

export const DEVNET_CONFIG = new NetworkConfiguration(
  "devnet",
  "https://fullnode.devnet.aptoslabs.com/v1",
  "https://faucet.devnet.aptoslabs.com",
  // hippo dex
  new HexString("0xa61e1e86e9f596e483283727d2739ba24b919012720648c29380f9cd0a96c11a"),
  new HexString("0x980a2b1bc2c60ae3e7b7cd1f22ee6fa078843a856b86b111c98f7dc744d2d2b4"),
  // coin list
  new HexString("0x498d8926f16eb9ca90cab1b3a26aa6f97a080b3fcbe6e83ae150b7243a00fb68"),
  // hippo aggregator
  new HexString("0xa61e1e86e9f596e483283727d2739ba24b919012720648c29380f9cd0a96c11a"),
  // pontem
  new HexString("0x43417434fd869edee76cca2a4d2301e528a1551b1d719b75c350c3c97d15b8b9"),
  // econia
  new HexString("0xa61e1e86e9f596e483283727d2739ba24b919012720648c29380f9cd0a96c11a")
);

export const CONFIGS = {
  localhost: LOCAL_CONFIG,
  devnet: DEVNET_CONFIG,
};
