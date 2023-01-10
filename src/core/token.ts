interface TokenStore {
  type: string;
}

export const tokenStore: TokenStore = {
  type: "0x3::token::TokenStore",
};
