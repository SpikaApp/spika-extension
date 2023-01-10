export const pendingClaims = (address: string): string => {
  return `
query MyQuery {
  current_token_pending_claims(
    where: {to_address: {_eq: "${address}"}, amount: {_gt: "0"}}
  ) {
    current_token_data {
      collection_name
      creator_address
      name
      description
      metadata_uri
    }
    from_address
    to_address
    amount
    property_version
    collection_data_id_hash
    token_data_id_hash
    last_transaction_timestamp
    last_transaction_version
  }
}
`;
};
