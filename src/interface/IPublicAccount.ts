interface IPublicAccount {
  account: string; // Deprecated and will be substituted by address in future
  publicKey: string;
  authKey: string;
  address: string;
}

export default IPublicAccount;
