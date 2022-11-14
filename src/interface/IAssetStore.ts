import ICoin from "./ICoin";

interface IAssetStore {
  address: string;
  assets: Array<ICoin>;
}

export default IAssetStore;
