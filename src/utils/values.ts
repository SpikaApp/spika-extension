import { ICoin } from "../interface";

export const stringToValue = (asset: ICoin, value: string): string => {
  const decimal: number = asset.data.decimals;
  const setDecimal = `${value}e-${decimal}`;
  return parseFloat(setDecimal)
    .toFixed(asset.data.decimals)
    .replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, "$1");
};

export const valueToString = (asset: ICoin, value: string): string => {
  const decimal: number = asset.data.decimals;
  const setDecimal = `${value}e${decimal}`;
  return Number(setDecimal).toString();
};
