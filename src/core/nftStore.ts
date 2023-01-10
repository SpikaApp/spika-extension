import { INftDetails } from "../interface";
import { INftStore } from "../interface/INftDetails";
import { PLATFORM } from "../utils/constants";
import { getStore, setStore } from "./store";

const _accountNfts = "accountNfts";

export const addNftStore = async (currentAddress: string): Promise<void> => {
  const nftStore: Array<INftStore> = await getStore(PLATFORM, _accountNfts);
  if (!nftStore) {
    const data: Array<INftStore> = [
      {
        address: currentAddress,
        nfts: [],
      },
    ];
    setStore(PLATFORM, _accountNfts, data);
  } else {
    const data = nftStore.find((i: INftStore) => i.address === currentAddress);
    if (!data) {
      nftStore.push({ address: currentAddress, nfts: [] });
      setStore(PLATFORM, _accountNfts, nftStore);
    }
  }
};

export const setNfts = async (currentAddress: string, nfts: Array<INftDetails>): Promise<boolean | undefined> => {
  if (currentAddress && nfts) {
    try {
      const data: Array<INftStore> = await getStore(PLATFORM, _accountNfts);
      if (data !== undefined || data !== null) {
        const result: INftStore | undefined = data.find((i: INftStore) => i.address === currentAddress);
        if (result === undefined) {
          return false;
        } else {
          const update: INftStore = {
            address: currentAddress,
            nfts: nfts,
          };
          const nftStore = data.filter((i: INftStore) => i.address !== currentAddress);
          nftStore.push(update);
          setStore(PLATFORM, _accountNfts, nftStore);
          return true;
        }
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    return false;
  }
};

export const getNfts = async (currentAddress: string): Promise<INftStore | undefined> => {
  try {
    const data: Array<INftStore> = await getStore(PLATFORM, _accountNfts);
    if (data !== undefined || data !== null) {
      const result = data.find((i: INftStore) => i.address === currentAddress);
      return result;
    }
  } catch (error) {
    console.log(error);
  }
};
