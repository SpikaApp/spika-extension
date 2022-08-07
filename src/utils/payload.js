import { BCS, TxnBuilderTypes } from "aptos/dist/transaction_builder";

// create collection payload
export const collection = async (name, description, uri, maxAmount) => {
  const payload = new TxnBuilderTypes.TransactionPayloadScriptFunction(
    TxnBuilderTypes.ScriptFunction.natural(
      "0x3::token",
      "create_collection_script",
      [],
      [
        BCS.bcsSerializeStr(name),
        BCS.bcsSerializeStr(description),
        BCS.bcsSerializeStr(uri),
        BCS.bcsSerializeUint64(maxAmount),
        BCS.serializeVectorWithFunc([false, false, false], "serializeBool"),
      ]
    )
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
  const payload = new TxnBuilderTypes.TransactionPayloadScriptFunction(
    TxnBuilderTypes.ScriptFunction.natural(
      "0x3::token",
      "create_token_script",
      [],
      [
        BCS.bcsSerializeStr(collectionName),
        BCS.bcsSerializeStr(name),
        BCS.bcsSerializeStr(description),
        BCS.bcsSerializeUint64(supply),
        BCS.bcsSerializeUint64(max),
        BCS.bcsSerializeStr(uri),
        BCS.bcsToBytes(TxnBuilderTypes.AccountAddress.fromHex(royalty_payee_address)),
        BCS.bcsSerializeUint64(royalty_points_denominator),
        BCS.bcsSerializeUint64(royalty_points_numerator),
        BCS.serializeVectorWithFunc([false, false, false, false, false], "serializeBool"),
        BCS.serializeVectorWithFunc(property_keys, "serializeStr"),
        BCS.serializeVectorWithFunc(property_values, "serializeStr"),
        BCS.serializeVectorWithFunc(property_types, "serializeStr"),
      ]
    )
  );

  return payload;
};
