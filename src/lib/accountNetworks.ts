import { INetwork, INetworkStore } from "../interface";
import { PLATFORM } from "../utils/constants";
import { getStore, setStore } from "./store";

const _networks = "accountNetworks";

export const addNetworkStore = async (currentAddress: string): Promise<void> => {
  const networks: Array<INetworkStore> = await getStore(PLATFORM, _networks);
  if (!networks) {
    const data: Array<INetworkStore> = [
      {
        address: currentAddress,
        networks: networkList,
      },
    ];
    setStore(PLATFORM, _networks, data);
  } else {
    const data: INetworkStore | undefined = networks.find((i: INetworkStore) => i.address === currentAddress);
    if (!data) {
      networks.push({
        address: currentAddress,
        networks: networkList,
      });
      setStore(PLATFORM, _networks, networks);
    }
  }
};

export const getNetworks = async (currentAddress: string): Promise<INetworkStore | undefined> => {
  try {
    const data: Array<INetworkStore> = await getStore(PLATFORM, _networks);
    if (data !== undefined || data !== null) {
      const result: INetworkStore | undefined = data.find((i) => i.address === currentAddress);
      // TODO: if statement to check for undefined
      return result;
    }
  } catch (error) {
    console.log(error);
  }
};

export const setNetwork = async (currentAddress: string, network: INetwork): Promise<boolean | undefined> => {
  if (currentAddress && network) {
    try {
      const data: Array<INetworkStore> = await getStore(PLATFORM, _networks);
      if (data !== undefined || data !== null) {
        const result: INetworkStore | undefined = data.find((i: INetworkStore) => i.address === currentAddress);
        if (result === undefined) {
          return false;
        } else {
          const _network: INetwork | undefined = result.networks.find((i: INetwork) => i.name === network.name);
          if (_network === undefined) {
            result.networks.push(network);
            setStore(PLATFORM, _networks, data);
            return true;
          } else {
            return false;
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    return false;
  }
};

export const getNetwork = async (currentAddress: string, network: INetwork) => {
  if (currentAddress && network) {
    try {
      const data: Array<INetworkStore> = await getStore(PLATFORM, _networks);
      if (data !== undefined || data !== null) {
        const result: INetworkStore | undefined = data.find((i: INetworkStore) => i.address === currentAddress);
        if (result === undefined) {
          return false;
        } else {
          const _network: INetwork | undefined = result.networks.find((i: INetwork) => i.name === network.name);
          if (_network === undefined) {
            return false;
          } else {
            return true;
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    return false;
  }
};

export const removeNetwork = async (currentAddress: string, network: INetwork): Promise<boolean | undefined> => {
  if (currentAddress && network) {
    try {
      const data: Array<INetworkStore> = await getStore(PLATFORM, _networks);
      if (data !== undefined || data !== null) {
        const result: INetworkStore | undefined = data.find((i: INetworkStore) => i.address === currentAddress);
        if (result === undefined) {
          return false;
        } else {
          const _network: INetwork | undefined = result.networks.find((i) => i.name === network.name);
          if (_network === undefined) {
            return false;
          } else {
            const index: number = result.networks.indexOf(network);
            result.networks.splice(index, 1);
            setStore(PLATFORM, _networks, data);
            return true;
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    return false;
  }
};

export const networkList: Array<INetwork> = [
  {
    name: "Mainnet",
    data: {
      node_url: "https://mainnet.aptoslabs.com/v1",
      testnet: false,
      custom: false,
    },
  },
  {
    name: "Testnet",
    data: {
      node_url: "https://testnet.aptoslabs.com/v1",
      faucet_url: "https://faucet.testnet.aptoslabs.com",
      testnet: true,
      custom: false,
    },
  },
  {
    name: "Devnet",
    data: {
      node_url: "https://fullnode.devnet.aptoslabs.com/v1",
      faucet_url: "https://faucet.devnet.aptoslabs.com",
      testnet: true,
      custom: false,
    },
  },
];
