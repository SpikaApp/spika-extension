import * as bip39 from "@scure/bip39";
import * as english from "@scure/bip39/wordlists/english";
import * as aptos from "aptos";
import { APTOS_DERIVE_PATH } from "../utils/constants";

export const createAccountTest = async (): Promise<void> => {
  const mnemonic = bip39.generateMnemonic(english.wordlist);
  const account = aptos.AptosAccount.fromDerivePath(APTOS_DERIVE_PATH, mnemonic);
  console.log(account);
};
