class SpikaWeb3 {
  requestId;
  wallet = "spika";

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
    return this._message("isConnected", {});
  }

  account() {
    return this._message("account", {});
  }

  network() {
    return this._message("network", {});
  }

  signMessage(message) {
    return this._message("signMessage", message);
  }

  signAndSubmitTransaction(transaction) {
    return this._message("signAndSubmitTransaction", transaction);
  }

  signTransaction(transaction) {
    return this._message("signTransaction", transaction);
  }

  onNetworkChange(callback) {
    return this._handleNetworkChange("onNetworkChange", callback);
  }

  onAccountChange(callback) {
    return this._handleAccountChange("onAccountChange", callback);
  }

  _message(method, args) {
    const wallet = this.wallet;
    const id = this.requestId++;
    return new Promise(function (resolve, reject) {
      window.postMessage({ wallet, method, args, id });
      window.addEventListener("message", function handler(event) {
        if (event.data.responseMethod === method && event.data.id === id) {
          const response = event.data.response;
          this.removeEventListener("message", handler);
          if (response === undefined || response === null) {
            reject("[inpage.js]: no response received");
          } else if (response.error) {
            reject(response.error ?? "Error");
          } else {
            console.log("[inpage.js]: response: ", response);
            resolve(response);
          }
        }
      });
    });
  }

  _handleNetworkChange(method, callback) {
    const wallet = this.wallet;
    const id = this.requestId++;
    window.postMessage({ wallet, method, id });
    window.addEventListener("message", async function handler(event) {
      if (event.data.method === "network_change_event") {
        const response = {
          networkName: event.data.network.name,
          api: event.data.network.api,
          chainId: event.data.network.chainId,
        };
        await callback(response);
      }
    });
  }

  _handleAccountChange(method, callback) {
    const wallet = this.wallet;
    const id = this.requestId++;
    window.postMessage({ wallet, method, id });
    window.addEventListener("message", async function handler(event) {
      if (event.data.method === "account_change_event") {
        const response = {
          address: event.data.account.address,
          publicKey: event.data.account.publicKey,
        };
        await callback(response);
      }
    });
  }
}

window.spika = new SpikaWeb3();
