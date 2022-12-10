const getTxnFunction = (functionString: string): string => {
  const data = functionString.split("::");
  if (data.length === 3) {
    return `${data[1]} ${data[2]}`;
  } else {
    return functionString;
  }
};

export default getTxnFunction;
