const copyToClipboard = (content: string): void => {
  navigator.clipboard.writeText(content);
};

export default copyToClipboard;
