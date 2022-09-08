export const stringToValue = (asset, value) => {
  const decimal = asset.data.decimals;
  const setDecimal = `${value}e-${decimal}`;
  const result = parseFloat(setDecimal)
    .toFixed(asset.data.decimals)
    .replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, "$1");

  return result;
};

export const valueToString = (asset, value) => {
  const decimal = asset.data.decimals;
  const setDecimal = `${value}e${decimal}`;
  const result = Number(setDecimal).toString();

  console.log(result);
  return result;
};
