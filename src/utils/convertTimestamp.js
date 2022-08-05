const convertTimestamp = (timestamp) => {
  let date = new Date(timestamp / 1000).toLocaleDateString("en-GB");
  let time = new Date(timestamp / 1000).toLocaleTimeString("en-GB");
  let result = `${date} ${time}`;
  return result;
};

export default convertTimestamp;
