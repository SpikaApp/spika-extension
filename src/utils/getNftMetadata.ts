import axios, { AxiosResponse } from "axios";
import { INftMetadata } from "../interface";

const callApi = async (url: string): Promise<AxiosResponse | undefined> => {
  const promise = axios.get(url);
  return promise
    .then((response) => response)
    .catch((error) => {
      if (error.response) {
        return error.response;
      } else if (error.request) {
        return error.request;
      } else {
        // Shall we return TypeError?...
        return undefined;
      }
    });
};

export const getNftMetadata = async (uri: string): Promise<INftMetadata | undefined> => {
  let url: string;
  if (uri.includes("ipfs://")) {
    url = `https://ipfs.io/ipfs/${uri.replace("ipfs://", "")}`;
  } else {
    url = uri;
  }
  const result = await callApi(url);
  if (result && result.status === 200) {
    return result.data;
  } else {
    return undefined;
  }
};
