import { setStore, getStore } from "./store";
import { PLATFORM } from "../utils/constants";

const _accountAssets = "accountAssets";

export const addAssetStore = async (currentAddress, asset) => {
  const assets = await getStore(PLATFORM, _accountAssets);
  if (!assets) {
    setStore(PLATFORM, _accountAssets, [
      {
        address: currentAddress,
        assets: [asset],
      },
    ]);
  } else {
    let data = assets.find((i) => i.address === currentAddress);
    if (!data) {
      assets.push({ address: currentAddress, assets: [asset] });
      setStore(PLATFORM, _accountAssets, assets);
    }
  }
};

export const getAccountAssets = async (currentAddress) => {
  try {
    const data = await getStore(PLATFORM, _accountAssets);
    if (data !== undefined || data !== null) {
      let result = data.find((i) => i.address === currentAddress);
      return result;
    }
  } catch (error) {
    console.log(error);
  }
};

export const setAsset = async (currentAddress, asset) => {
  if (currentAddress && asset) {
    try {
      const data = await getStore(PLATFORM, _accountAssets);
      if (data !== undefined || data !== null) {
        let result = data.find((i) => i.address === currentAddress);
        if (result === undefined) {
          return false;
        } else {
          let _asset = result.assets.find((i) => i.id === asset.id);
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
