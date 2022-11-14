const saveToFile = (filename: string, data: string): void => {
  const blob: Blob = new Blob([data], { type: "text/plain" });
  const url: string = window.URL.createObjectURL(blob);
  const a: HTMLAnchorElement = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
};

export default saveToFile;
