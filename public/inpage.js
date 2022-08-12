class SpikaWeb3 {
  requestId;

  constructor() {
    this.requestId = 0;
  }

  connect() {
    return this._message("connect", {});
  }

  disconnect() {
    return this._message("disconnect", {});
  }

  isConnected() {
    return this._message("is_connected", {});
  }

  account() {
    return this._message("getAccountAddress", {});
  }

  signAndSubmitTransaction(transaction) {
    return this._message("signAndSubmit", transaction);
  }

  signTransaction(transaction) {
    return this._message("signTransaction", transaction);
  }

  _message(method, args) {
    const id = this.requestId++;
    return new Promise(function (resolve, reject) {
      window.postMessage({ method, args, id });
      window.addEventListener("message", function handler(event) {
        if (event.data.responseMethod === method && event.data.id === id) {
          const response = event.data.response;
          this.removeEventListener("message", handler);
          if (response === undefined) {
            reject("no response received");
          } else if (response.error) {
            reject(response.error ?? "Error");
          } else {
            console.log("response received: ", response);
            resolve(response);
          }
        }
      });
    });
  }
}

window.spika = new SpikaWeb3();
