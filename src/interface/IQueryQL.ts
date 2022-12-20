export interface IPendingClaims {
  current_token_pending_claims: Array<IPendingClaim>;
}

export interface IPendingClaim {
  current_token_data: ITokenData;
  from_address: string;
  to_address: string;
  amount: number;
  property_version: number;
  collection_data_id_hash: string;
  token_data_id_hash: string;
  last_transaction_timestamp: string;
  last_transaction_version: number;
}

interface ITokenData {
  collection_name: string;
  creator_address: string;
  name: string;
  description: string;
  metadata_uri: string;
  image?: string;
}
