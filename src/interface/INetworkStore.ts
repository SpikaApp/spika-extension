import { INetwork } from "./";

interface INetworkStore {
  address: string;
  networks: Array<INetwork>;
}

export default INetworkStore;
