import { AptosClient } from "aptos";
import { INetwork } from "../interface";
import { getStore, setStore } from "../lib/store";
import { PLATFORM } from "./constants";

const _currentNetwork = "currentNetwork";
const aptosApiVersion: string = import.meta.env.VITE_SPIKA_APTOS_API_VERSION;

const aptosNodeMainnet: string = import.meta.env.VITE_SPIKA_APTOS_NODE_MAINNET + aptosApiVersion;
const aptosNodeTestnet: string = import.meta.env.VITE_SPIKA_APTOS_NODE_TESTNET + aptosApiVersion;
const aptosNodeDevnet: string = import.meta.env.VITE_SPIKA_APTOS_NODE_DEVNET + aptosApiVersion;

interface IAptosNetwork {
  mainnet: INetworkResponse;
  testnet: INetworkResponse;
  devnet: INetworkResponse;
}

interface INetworkResponse {
  name: string;
  api: string;
  chainId: number;
}

const getCurrentNetwork = async (): Promise<INetworkResponse> => {
  const getChainId = async (nodeUrl: string) => {
    const client = new AptosClient(nodeUrl);
    return await client.getChainId();
  };

  const getAptosNetworks = async () => {
    const mainnet = await getChainId(aptosNodeMainnet);
    const testnet = await getChainId(aptosNodeTestnet);
    const devnet = await getChainId(aptosNodeDevnet);

    const result: IAptosNetwork = {
      mainnet: {
        name: "mainnet",
        api: aptosNodeMainnet,
        chainId: mainnet,
      },
      testnet: {
        name: "testnet",
        api: aptosNodeTestnet,
        chainId: testnet,
      },
      devnet: {
        name: "devnet",
        api: aptosNodeDevnet,
        chainId: devnet,
      },
    };
    return result;
  };

  const aptosNetwork: IAptosNetwork = await getAptosNetworks();

  const currentNetwork: INetwork = await getStore(PLATFORM, _currentNetwork);

  const currentChainId = await getChainId(currentNetwork.data.node_url);

  let response: INetworkResponse;

  switch (currentChainId) {
    case aptosNetwork.mainnet.chainId:
      response = aptosNetwork.mainnet;
      break;
    case aptosNetwork.testnet.chainId:
      response = aptosNetwork.testnet;
      break;
    case aptosNetwork.devnet.chainId:
      response = aptosNetwork.devnet;
      break;
    default:
      response = {
        name: currentNetwork.name.toLocaleLowerCase(),
        chainId: currentChainId,
        api: currentNetwork.data.node_url,
      };
  }
  setStore(PLATFORM, "networkResponse", response);
  return response;
};

export default getCurrentNetwork;
