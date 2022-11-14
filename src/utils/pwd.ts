import { v5 as uuidv5 } from "uuid";
import passworder from "@metamask/browser-passworder";
import { IEncryptedPwd } from "../interface";

const appKey = import.meta.env.VITE_SPIKA_KEY;
const appRandom = import.meta.env.VITE_SPIKA_RANDOM;

export const encryptPassword = async (pwd: string): Promise<IEncryptedPwd> => {
  const timestamp: number = Date.now();
  const key: string = (timestamp + appRandom).toString();
  const secret: string = uuidv5(key, appKey);
  const encryptedPassword: string = await passworder.encrypt(secret, pwd);
  const result: IEncryptedPwd = {
    data: encryptedPassword,
    id: timestamp,
  };
  return result;
};

export const decryptPassword = async (pwd: IEncryptedPwd): Promise<string> => {
  const timestamp = pwd.id;
  const key = (timestamp + appRandom).toString();
  const secret = uuidv5(key, appKey);
  const decryptedPassword: string = await passworder.decrypt(secret, pwd.data);
  return decryptedPassword;
};
