import { tokenClient } from "./client";
import { BCS, TxnBuilderTypes } from "aptos/dist/transaction_builder";

export const transfer = async (recipientAddress, currentAsset, amount) => {
  const token = new TxnBuilderTypes.TypeTagStruct(
    TxnBuilderTypes.StructTag.fromString(currentAsset)
  );
  const payload = new TxnBuilderTypes.TransactionPayloadEntryFunction(
    TxnBuilderTypes.EntryFunction.natural(
      "0x1::coin",
      "transfer",
      [token],
      [
        BCS.bcsToBytes(TxnBuilderTypes.AccountAddress.fromHex(recipientAddress)),
        BCS.bcsSerializeUint64(amount),
      ]
    )
  );

  return payload;
};

// create collection payload
export const collection = async (name, description, uri, maxAmount) => {
  const payload = tokenClient.transactionBuilder.buildTransactionPayload(
    "0x3::token::create_collection_script",
    [],
    [name, description, uri, maxAmount, [false, false, false]]
  );

  return payload;
};

// create nft payload
export const nft = async (
  address,
  collectionName,
  name,
  description,
  supply,
  uri,
  max,
  royalty_payee_address = address,
  royalty_points_denominator = 0,
  royalty_points_numerator = 0,
  property_keys = [],
  property_values = [],
  property_types = []
) => {
  const payload = tokenClient.transactionBuilder.buildTransactionPayload(
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
