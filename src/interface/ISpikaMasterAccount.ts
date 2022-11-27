import { IPublicAccount } from ".";

export interface ISpikaMasterAccount {
  master: Array<ISpikaAccount>;
  latest: number;
}

export interface ISpikaAccount {
  name: string;
  index: number;
  data: IPublicAccount;
}
