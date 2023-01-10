import { setStore, getStore } from "./store";
import { PLATFORM } from "../utils/constants";
import { ICoin, IAssetStore } from "../interface";

const _accountAssets = "accountAssets";

export const addAssetStore = async (currentAddress: string, asset: ICoin): Promise<void> => {
  const assets: Array<IAssetStore> = await getStore(PLATFORM, _accountAssets);
  if (!assets) {
    const data: Array<IAssetStore> = [
      {
        address: currentAddress,
        assets: [asset],
      },
    ];
    setStore(PLATFORM, _accountAssets, data);
  } else {
    const data = assets.find((i: IAssetStore) => i.address === currentAddress);
    if (!data) {
      assets.push({ address: currentAddress, assets: [asset] });
      setStore(PLATFORM, _accountAssets, assets);
    }
  }
};

export const setAssetStore = async (currentAddress: string, assets: Array<ICoin>): Promise<boolean | undefined> => {
  if (currentAddress && assets) {
    try {
      const data: Array<IAssetStore> = await getStore(PLATFORM, _accountAssets);
      if (data !== undefined || data !== null) {
        const result: IAssetStore | undefined = data.find((i: IAssetStore) => i.address === currentAddress);
        if (result === undefined) {
          return false;
        } else {
          const _data: IAssetStore = {
            address: currentAddress,
            assets: assets,
          };
          const store = data.filter((i: IAssetStore) => i.address !== currentAddress);
          store.push(_data);
          setStore(PLATFORM, _accountAssets, store);
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

export const getAssetStore = async (currentAddress: string): Promise<IAssetStore | undefined> => {
  try {
    const data: Array<IAssetStore> = await getStore(PLATFORM, _accountAssets);
    if (data !== undefined || data !== null) {
      const result = data.find((i: IAssetStore) => i.address === currentAddress);
      return result;
    }
  } catch (error) {
    console.log(error);
  }
};
