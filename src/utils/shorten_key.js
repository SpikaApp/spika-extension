const shortenKey = (key) => `${key.slice(0, 2)}${key.slice(key.length - 64)}`;

export default shortenKey;
