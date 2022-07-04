const timeConvert = (timestamp) => {
  const date = new Date(timestamp / 1000).toLocaleDateString("en-GB");
  const time = new Date(timestamp / 1000).toLocaleTimeString("en-GB");
  const result = `${date} ${time}`;
  return result;
};

export default timeConvert;
