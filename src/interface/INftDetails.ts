interface INftDetails {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default_properties: any;
  description: string;
  largest_property_version: string;
  maximum: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mutability_config: any;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  royalty: any;
  supply: string;
  uri: string;
  attributes: Array<INftAttributes>;
  creator?: string;
  collection?: string;
}

export interface INftMetadata {
  name: string;
  description: string;
  image: string;
  imageHash: string;
  edition: number;
  date: string;
  attributes: Array<INftAttributes>;
  compiler: string;
}

export interface INftAttributes {
  trait_type: string;
  value: string;
}

export interface INftStore {
  address: string;
  nfts: Array<INftDetails>;
}

export default INftDetails;
