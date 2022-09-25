import { v5 as uuidv5 } from "uuid";
import * as passworder from "@metamask/browser-passworder";

const appKey = import.meta.env.VITE_SPIKA_KEY;
const appRandom = import.meta.env.VITE_SPIKA_RANDOM;

export const encryptPassword = async (pwd) => {
  const timestamp = Date.now();
  const key = (timestamp + appRandom).toString();
  const secret = uuidv5(key, appKey);
  console.log(secret);
  const encryptedPassword = await passworder.encrypt(secret, pwd);
  const result = {
    data: encryptedPassword,
    id: timestamp,
  };
  return result;
};

export const decryptPassword = async (pwd) => {
  const timestamp = pwd.id;
  const key = (timestamp + appRandom).toString();
  const secret = uuidv5(key, appKey);
  const decryptedPassword = await passworder.decrypt(secret, pwd.data);
  return decryptedPassword;
};
