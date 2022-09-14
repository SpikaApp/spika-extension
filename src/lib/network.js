import { PLATFORM } from "../utils/constants";
import { setStore, getStore } from "./store";

const _networks = "accountNetworks";

export const addNetworkStore = async (currentAddress) => {
  const networks = await getStore(PLATFORM, _networks);
  if (!networks) {
    setStore(PLATFORM, _networks, [
      {
        address: currentAddress,
        networks: networkList,
      },
    ]);
  } else {
    let data = networks.find((i) => i.address === currentAddress);
    if (!data) {
      networks.push({
        address: currentAddress,
        urls: [
          {
            address: currentAddress,
            networks: networkList,
          },
        ],
      });
      setStore(PLATFORM, _networks, networks);
    }
  }
};

export const getNetworks = async (currentAddress) => {
  try {
    const data = await getStore(PLATFORM, _networks);
    if (data !== undefined || data !== null) {
      let result = data.find((i) => i.address === currentAddress);
      return result;
    }
  } catch (error) {
    console.log(error);
  }
};

export const setNetwork = async (currentAddress, network) => {
  if (currentAddress && network) {
    try {
      const data = await getStore(PLATFORM, _networks);
      if (data !== undefined || data !== null) {
        let result = data.find((i) => i.address === currentAddress);
        if (result === undefined) {
          return false;
        } else {
          let _network = result.networks.find((i) => i.name === network.name);
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

export const getNetwork = async (currentAddress, network) => {
  if (currentAddress && network) {
    try {
      const data = await getStore(PLATFORM, _networks);
      if (data !== undefined || data !== null) {
        let result = data.find((i) => i.address === currentAddress);
        if (result === undefined) {
          return false;
        } else {
          let _network = result.networks.find((i) => i.name === network.name);
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

export const removeNetwork = async (currentAddress, network) => {
  if (currentAddress && network) {
    try {
      const data = await getStore(PLATFORM, _networks);
      if (data !== undefined || data !== null) {
        let result = data.find((i) => i.address === currentAddress);
        if (result === undefined) {
          return false;
        } else {
          let _network = result.networks.find((i) => i.name === network.name);
          if (_network === undefined) {
            return false;
          } else {
            let index = result.networks.indexOf(network);
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

export const networkList = [
  {
    name: "Devnet",
    data: {
      node_url: "https://fullnode.devnet.aptoslabs.com/v1",
      faucet_url: "https://faucet.devnet.aptoslabs.com",
      testnet: true,
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
];
