import { IExplorerNetwork } from "../interface";

export const getNetworkString = (networkString: string): IExplorerNetwork => {
  switch (networkString) {
    case "Mainnet":
      return "mainnet";
    case "Testnet":
      return "testnet";
    case "Devnet":
      return "devnet";
    default:
      return "mainnet";
  }
};
