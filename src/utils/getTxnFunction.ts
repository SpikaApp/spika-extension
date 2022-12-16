const getTxnFunction = (functionString: string): string => {
  try {
    const data = functionString.split("::");
    if (data.length === 3) {
      return `${data[1]} ${data[2]}`;
    } else {
      return functionString;
    }
  } catch (error) {
    return "N/A";
  }
};

export default getTxnFunction;
