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
  creator?: string;
  collection?: string;
}

export default INftDetails;
