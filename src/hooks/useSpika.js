import { useEffect, useState } from "react";
import { AptosClient, TokenClient, FaucetClient } from "aptos";

const useSpika = (network) => {
  const [spikaClient, setSpikaClient] = useState({
    client: new AptosClient(network.data.node_url),
    tokenClient: new TokenClient(new AptosClient(network.data.node_url)),
    faucetClient: new FaucetClient(network.data.node_url, network.data.faucet_url, null),
  });

  useEffect(() => {
    const _spikaClient = {
      client: new AptosClient(network.data.node_url),
      tokenClient: new TokenClient(new AptosClient(network.data.node_url)),
      faucetClient: new FaucetClient(network.data.node_url, network.data.faucet_url, null),
    };
    setSpikaClient(_spikaClient);
  }, [network]);
  return { spikaClient };
};

export default useSpika;
