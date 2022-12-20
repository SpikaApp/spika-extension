import { BCS, TxnBuilderTypes } from "aptos";
import React, { createContext } from "react";
import {
  IContextPayload,
  IPayloadCollectionArgs,
  IPayloadNftArgs,
  IPayloadTransferArgs,
  IPayloadOfferArgs,
  IPayloadClaimArgs,
} from "../interface";
import { spikaClient } from "../lib/client";
import debug from "../utils/debug";

type PayloadContextProps = {
  children: React.ReactNode;
};

export const PayloadContext = createContext<IContextPayload>({} as IContextPayload);

export const PayloadProvider = ({ children }: PayloadContextProps) => {
  // Create account on chain
  const create = async (address: string): Promise<TxnBuilderTypes.TransactionPayloadEntryFunction> => {
    return new TxnBuilderTypes.TransactionPayloadEntryFunction(
      TxnBuilderTypes.EntryFunction.natural(
        "0x1::aptos_account",
        "create_account",
        [],
        [BCS.bcsToBytes(TxnBuilderTypes.AccountAddress.fromHex(address))]
      )
    );
  };

  // Register coin in account
  const register = async (coinType: string): Promise<TxnBuilderTypes.TransactionPayloadEntryFunction> => {
    const token = new TxnBuilderTypes.TypeTagStruct(TxnBuilderTypes.StructTag.fromString(coinType));
    return new TxnBuilderTypes.TransactionPayloadEntryFunction(
      TxnBuilderTypes.EntryFunction.natural("0x1::managed_coin", "register", [token], [])
    );
  };

  // Transfer coin between addresses
  const transfer = async (args: IPayloadTransferArgs): Promise<TxnBuilderTypes.TransactionPayloadEntryFunction> => {
    const token = new TxnBuilderTypes.TypeTagStruct(TxnBuilderTypes.StructTag.fromString(args.currentAsset));
    const payload = new TxnBuilderTypes.TransactionPayloadEntryFunction(
      TxnBuilderTypes.EntryFunction.natural(
        "0x1::coin",
        "transfer",
        [token],
        [
          BCS.bcsToBytes(TxnBuilderTypes.AccountAddress.fromHex(args.recipientAddress)),
          BCS.bcsSerializeUint64(args.amount),
        ]
      )
    );
    debug.log("Payload prepared:", payload);
    return payload;
  };

  // Create new NFT collection
  const collection = async (args: IPayloadCollectionArgs): Promise<TxnBuilderTypes.TransactionPayload> => {
    const spika = await spikaClient();
    const payload = spika.tokenClient.transactionBuilder.buildTransactionPayload(
      "0x3::token::create_collection_script",
      [],
      [args.name, args.description, args.uri, args.maxAmount, [false, false, false]]
    );
    debug.log("Payload prepared:", payload);
    return payload;
  };

  // Create NFT
  const nft = async (args: IPayloadNftArgs): Promise<TxnBuilderTypes.TransactionPayload> => {
    const spika = await spikaClient();
    const payload = spika.tokenClient.transactionBuilder.buildTransactionPayload(
      "0x3::token::create_token_script",
      [],
      [
        args.collectionName,
        args.name,
        args.description,
        parseInt(args.supply),
        args.max,
        args.uri,
        args.address, // royalty_payee_address
        0, // royalty_points_denominator
        0, // royalty_points_numerator
        [false, false, false, false, false],
        [], //property_keys
        [], // property_values
        [], //property_types
      ]
    );
    debug.log("Payload prepared:", payload);
    return payload;
  };

  // Offer NFT
  const offer = async (args: IPayloadOfferArgs): Promise<TxnBuilderTypes.TransactionPayload> => {
    const spika = await spikaClient();
    const payload = spika.tokenClient.transactionBuilder.buildTransactionPayload(
      "0x3::token_transfers::offer_script",
      [],
      [args.receiver, args.creator, args.collectionName, args.name, args.property_version, args.amount]
    );
    debug.log("Payload prepared:", payload);
    return payload;
  };

  const claim = async (args: IPayloadClaimArgs): Promise<TxnBuilderTypes.TransactionPayload> => {
    const spika = await spikaClient();
    const payload = spika.tokenClient.transactionBuilder.buildTransactionPayload(
      "0x3::token_transfers::claim_script",
      [],
      [args.sender, args.creator, args.collectionName, args.name, args.property_version]
    );
    debug.log("Payload prepared:", payload);
    return payload;
  };

  return (
    <PayloadContext.Provider
      value={{
        create,
        register,
        transfer,
        collection,
        nft,
        offer,
        claim,
      }}
    >
      {children}
    </PayloadContext.Provider>
  );
};
