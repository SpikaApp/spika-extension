import { validateMnemonic } from "@scure/bip39";
import * as english from "@scure/bip39/wordlists/english";

export interface IMnemonicWord {
  index: number;
  value: string;
}

export const normalizeMnemonic = (mnemonic: string): Array<IMnemonicWord> => {
  const input = mnemonic.split(" ");
  const result: Array<IMnemonicWord> = [];
  input.map((word, index) => {
    const data: IMnemonicWord = {
      index: index,
      value: word,
    };
    result.push(data);
  });
  if (result.length === 12) {
    let test = "";
    result.map((word, index) => {
      if (index === 0) {
        test = word.value;
      } else {
        test = `${test} ${word.value}`;
      }
    });
    const validated = validateMnemonic(test, english.wordlist);

    if (validated) {
      return result;
    } else {
      throw new Error("Invalid mnemonic phrase");
    }
  } else {
    throw new Error("Invalid length");
  }
};

export const mnemonicToString = (mnemonic: Array<IMnemonicWord>): string => {
  let result = "";
  mnemonic.map((word, index) => {
    if (index === 0) {
      result = word.value;
    } else {
      result = `${result} ${word.value}`;
    }
  });
  const validated = validateMnemonic(result, english.wordlist);
  if (validated) {
    return result;
  } else {
    throw new Error("Invalid mnemonic phrase");
  }
};

export const createEmptyMnemonicObject = (): Array<IMnemonicWord> => {
  const result: Array<IMnemonicWord> = [];
  for (let i = 0; i < 12; i++) {
    const data: IMnemonicWord = {
      index: i,
      value: "",
    };
    result.push(data);
  }
  return result;
};
