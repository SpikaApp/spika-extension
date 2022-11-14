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

export const getAccountAssets = async (currentAddress: string): Promise<IAssetStore | undefined> => {
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

export const setAsset = async (currentAddress: string, asset: ICoin): Promise<boolean | undefined> => {
  if (currentAddress && asset) {
    try {
      const data: Array<IAssetStore> = await getStore(PLATFORM, _accountAssets);
      if (data !== undefined || data !== null) {
        const result: IAssetStore | undefined = data.find((i: IAssetStore) => i.address === currentAddress);
        if (result === undefined) {
          return false;
        } else {
          const _asset: ICoin | undefined = result.assets.find((i: ICoin) => i.type === asset.type);
          if (_asset === undefined) {
            result.assets.push(asset);
            setStore(PLATFORM, _accountAssets, data);
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

export const getAsset = async (currentAddress: string, asset: ICoin): Promise<ICoin | boolean | undefined> => {
  if (currentAddress && asset) {
    try {
      const data: Array<IAssetStore> = await getStore(PLATFORM, _accountAssets);
      if (data !== undefined || data !== null) {
        const result: IAssetStore | undefined = data.find((i: IAssetStore) => i.address === currentAddress);
        if (result === undefined) {
          return false;
        } else {
          const _asset = result.assets.find((i: ICoin) => i.type === asset.type);
          if (_asset === undefined) {
            return false;
          } else {
            return _asset;
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
