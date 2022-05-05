const shortenAddress32 = (address) => `${address.slice(0, 16)}...${address.slice(address.length - 16)}`;

export default shortenAddress32;
