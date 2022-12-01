/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Button, Card, CardContent, Container, Stack } from "@mui/material";
import * as bip39 from "@scure/bip39";
import * as english from "@scure/bip39/wordlists/english";
import * as aptos from "aptos";
import { Types } from "aptos";
import { useContext } from "react";
import AccountDetailsDialog from "../components/AccountDetailsDialog";
import AccountManagerDialog from "../components/AccountManagerDialog";
import ChangePasswordDialog from "../components/ChangePasswordDialog";
import NetworkDialog from "../components/NetworkDialog";
import { AccountContext } from "../context/AccountContext";
import { PayloadContext } from "../context/PayloadContext";
import { UIContext } from "../context/UIContext";
import { Web3Context } from "../context/Web3Context";
import { spikaClient } from "../lib/client";
import { addSpikaAccount, initSpikaMasterAccount } from "../lib/spikaAccount";
import { APTOS_DERIVE_PATH } from "../utils/constants";
import debug from "../utils/debug";

const Tests = (): JSX.Element => {
  const { handleAccountManagerUI } = useContext(UIContext);
  const { accountImported, currentAddress, validateAccount, publicAccount } = useContext(AccountContext);
  const { estimateTransaction, handleSend } = useContext(Web3Context);
  const { create } = useContext(PayloadContext);

  const generateAddress = async (): Promise<void> => {
    const mnemonic = bip39.generateMnemonic(english.wordlist);
    const account = aptos.AptosAccount.fromDerivePath(APTOS_DERIVE_PATH, mnemonic);
    debug.log("Aptos account created:", account);
    debug.log("Address:", account.address().hex());
  };

  const estimateGasPrice = async (): Promise<Types.GasEstimation> => {
    const spika = await spikaClient();
    return await spika.client.estimateGasPrice();
  };

  const estimateMaxGasAmount = async () => {
    const spika = await spikaClient();
    const result = await spika.client.estimateMaxGasAmount(currentAddress!);
    debug.log("Estimated max gas amount", result);
  };

  const createAccount = async (): Promise<void> => {
    const address = "0x429781d9a97c054e259ca466405364d5d7262ba090ccbf7aeab6f6eeec5600a9";
    const validated = await validateAccount(address);

    if (validated) {
      debug.log("Account already exsist:", address, validated);
      return;
    } else {
      const payload = await create(address);
      debug.log("Payload prepared:", payload);
      await estimateTransaction(payload, true);
      await handleSend(payload, true);
    }
  };

  return (
    <Container maxWidth="xs">
      <Card sx={{ mb: 2, mt: "100px", minHeight: "450px" }}>
        <CardContent sx={{ alignSelf: "center", mt: 1 }}>
          {accountImported && (
            <Stack sx={{ width: "200px" }}>
              <Button sx={{ mb: 2 }} variant="outlined" onClick={generateAddress}>
                Generate Address
              </Button>
              <Button sx={{ mb: 2 }} variant="outlined" onClick={estimateGasPrice}>
                Estimate Gas Price
              </Button>
              <Button sx={{ mb: 2 }} variant="outlined" onClick={estimateMaxGasAmount}>
                Estimate Max Gas
              </Button>
              <Button sx={{ mb: 2 }} variant="outlined" onClick={createAccount}>
                Create Account
              </Button>
              <Button sx={{ mb: 2 }} variant="outlined" onClick={handleAccountManagerUI}>
                Account Manager
              </Button>
              <Button sx={{ mb: 2 }} variant="outlined" onClick={() => initSpikaMasterAccount(publicAccount!)}>
                Init Account
              </Button>
              <Button sx={{ mb: 2 }} variant="outlined" onClick={addSpikaAccount}>
                Add Account
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>
      {accountImported && (
        <div>
          <AccountDetailsDialog />
          <ChangePasswordDialog />
          <NetworkDialog />
          <AccountManagerDialog />
        </div>
      )}
    </Container>
  );
};

export default Tests;
