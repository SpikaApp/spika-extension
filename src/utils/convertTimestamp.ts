const convertTimestamp = (timestamp: number): string => {
  const date: string = new Date(timestamp / 1000).toLocaleDateString("en-GB");
  const time: string = new Date(timestamp / 1000).toLocaleTimeString("en-GB");
  return `${date} ${time}`;
};

export default convertTimestamp;
