import IPublicAccount from "./IPublicAccount";

interface IConnectedApps {
  publicAccount: IPublicAccount;
  urls: Array<string>;
}

export default IConnectedApps;
