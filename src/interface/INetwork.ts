interface INetwork {
  name: string;
  data: INetworkData;
}

interface INetworkData {
  node_url: string;
  faucet_url?: string;
  testnet: boolean;
  custom: boolean;
}

export default INetwork;
