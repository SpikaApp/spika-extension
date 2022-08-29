const saveToFile = (filename, data) => {
  var blob = new Blob([data], { type: "text/plain" });
  var url = window.URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
};

export default saveToFile;
