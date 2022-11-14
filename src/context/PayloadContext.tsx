import { BCS, TxnBuilderTypes } from "aptos";
import React, { createContext, FC } from "react";
import { spikaClient } from "../lib/client";

type Props = {
  children: React.ReactNode;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PayloadContext = createContext<any>(undefined);

export const PayloadProvider: FC<Props> = ({ children }) => {
  const register = async (coinType: string): Promise<TxnBuilderTypes.TransactionPayloadEntryFunction> => {
    const token = new TxnBuilderTypes.TypeTagStruct(TxnBuilderTypes.StructTag.fromString(coinType));
    return new TxnBuilderTypes.TransactionPayloadEntryFunction(
      TxnBuilderTypes.EntryFunction.natural("0x1::managed_coin", "register", [token], [])
    );
  };

  const transfer = async (
    recipientAddress: string,
    currentAsset: string,
    amount: number
  ): Promise<TxnBuilderTypes.TransactionPayloadEntryFunction> => {
    const token = new TxnBuilderTypes.TypeTagStruct(TxnBuilderTypes.StructTag.fromString(currentAsset));
    const payload = new TxnBuilderTypes.TransactionPayloadEntryFunction(
      TxnBuilderTypes.EntryFunction.natural(
        "0x1::coin",
        "transfer",
        [token],
        [BCS.bcsToBytes(TxnBuilderTypes.AccountAddress.fromHex(recipientAddress)), BCS.bcsSerializeUint64(amount)]
      )
    );

    return payload;
  };

  const collection = async (
    name: string,
    description: string,
    uri: string,
    maxAmount: string
  ): Promise<TxnBuilderTypes.TransactionPayload> => {
    const spika = await spikaClient();
    const payload = spika.tokenClient.transactionBuilder.buildTransactionPayload(
      "0x3::token::create_collection_script",
      [],
      [name, description, uri, maxAmount, [false, false, false]]
    );

    return payload;
  };

  const nft = async (
    address: string,
    collectionName: string,
    name: string,
    description: string,
    supply: string,
    uri: string,
    max: string,
    royalty_payee_address = address,
    royalty_points_denominator = 0,
    royalty_points_numerator = 0,
    property_keys = [],
    property_values = [],
    property_types = []
  ): Promise<TxnBuilderTypes.TransactionPayload> => {
    const spika = await spikaClient();
    const payload = spika.tokenClient.transactionBuilder.buildTransactionPayload(
      "0x3::token::create_token_script",
      [],
      [
        collectionName,
        name,
        description,
        parseInt(supply),
        max,
        uri,
        royalty_payee_address,
        royalty_points_denominator,
        royalty_points_numerator,
        [false, false, false, false, false],
        property_keys,
        property_values,
        property_types,
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
