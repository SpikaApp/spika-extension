const copyToClipboard = (content) => {
  navigator.clipboard.writeText(content);
};

export default copyToClipboard;
