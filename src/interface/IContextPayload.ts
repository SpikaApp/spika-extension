import { AptosAccount, TxnBuilderTypes } from "aptos";

interface IContextPayload {
  create: (address: string) => Promise<TxnBuilderTypes.TransactionPayloadEntryFunction>;
  register: (coinType: string) => Promise<TxnBuilderTypes.TransactionPayloadEntryFunction>;
  transfer: (args: IPayloadTransferArgs) => Promise<TxnBuilderTypes.TransactionPayloadEntryFunction>;
  collection: (args: IPayloadCollectionArgs) => Promise<TxnBuilderTypes.TransactionPayload>;
  nft: (args: IPayloadNftArgs) => Promise<TxnBuilderTypes.TransactionPayload>;
  offer: (args: IPayloadOfferArgs) => Promise<TxnBuilderTypes.TransactionPayload>;
  claim: (args: IPayloadClaimArgs) => Promise<TxnBuilderTypes.TransactionPayload>;
}

export interface IPayloadTransferArgs {
  recipientAddress: string;
  currentAsset: string;
  amount: number;
}

export interface IPayloadCollectionArgs {
  name: string;
  description: string;
  uri: string;
  maxAmount: number;
}

export interface IPayloadNftArgs {
  address: string;
  collectionName: string;
  name: string;
  description: string;
  supply: string;
  uri: string;
  max: number;
  royalty_payee_address?: string;
  royalty_points_denominator?: number;
  royalty_points_numerator?: number;
  property_keys?: Array<string>;
  property_values?: Array<string>;
  property_types?: Array<string>;
}

export interface IPayloadOfferArgs {
  account: AptosAccount;
  receiver: string;
  creator: string;
  collectionName: string;
  name: string;
  amount: number;
  property_version: number;
}

export interface IPayloadClaimArgs {
  account: AptosAccount;
  sender: string;
  creator: string;
  collectionName: string;
  name: string;
  property_version: number;
}

export default IContextPayload;
