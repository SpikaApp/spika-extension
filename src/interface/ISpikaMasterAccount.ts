import { IPublicAccount } from ".";

export interface ISpikaMasterAccount {
  master: Array<ISpikaAccount>;
  keystone?: Array<IKeystoneAccount>;
  latest: number;
}

export interface ISpikaAccount {
  name: string;
  index: number;
  data: IPublicAccount;
}

export interface IKeystoneAccount {
  hdPath: string;
  name: string;
  account: string;
  index: number;
  device: string;
}
