import { BCS, TxnBuilderTypes } from "aptos";
import React, { createContext } from "react";
import { IContextPayload, IPayloadCollectionArgs, IPayloadNftArgs, IPayloadTransferArgs } from "../interface";
import { spikaClient } from "../lib/client";

type PayloadContextProps = {
  children: React.ReactNode;
};

export const PayloadContext = createContext<IContextPayload>({} as IContextPayload);

export const PayloadProvider = ({ children }: PayloadContextProps) => {
  const register = async (coinType: string): Promise<TxnBuilderTypes.TransactionPayloadEntryFunction> => {
    const token = new TxnBuilderTypes.TypeTagStruct(TxnBuilderTypes.StructTag.fromString(coinType));
    return new TxnBuilderTypes.TransactionPayloadEntryFunction(
      TxnBuilderTypes.EntryFunction.natural("0x1::managed_coin", "register", [token], [])
    );
  };

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
    return payload;
  };

  const collection = async (args: IPayloadCollectionArgs): Promise<TxnBuilderTypes.TransactionPayload> => {
    const spika = await spikaClient();
    const payload = spika.tokenClient.transactionBuilder.buildTransactionPayload(
      "0x3::token::create_collection_script",
      [],
      [args.name, args.description, args.uri, args.maxAmount, [false, false, false]]
    );
    return payload;
  };

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
    return payload;
  };

  return (
    <PayloadContext.Provider
      value={{
        register,
        transfer,
        collection,
        nft,
      }}
    >
      {children}
    </PayloadContext.Provider>
  );
};
