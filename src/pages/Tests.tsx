/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Button, Card, CardContent, Container, Stack } from "@mui/material";
import { Types } from "aptos";
import { useContext } from "react";
import AccountDetailsDialog from "../components/AccountDetailsDialog";
import ChangePasswordDialog from "../components/ChangePasswordDialog";
import Footer from "../components/Footer";
import NetworkDialog from "../components/NetworkDialog";
import { AccountContext } from "../context/AccountContext";
import { spikaClient } from "../lib/client";

const Tests = (): JSX.Element => {
  const { accountImported, currentAddress } = useContext(AccountContext);

  const estimateGasPrice = async (): Promise<Types.GasEstimation> => {
    const spika = await spikaClient();
    return await spika.client.estimateGasPrice();
  };

  const estimateMaxGasAmount = async () => {
    const spika = await spikaClient();
    const result = await spika.client.estimateMaxGasAmount(currentAddress!);
    console.log(result);
  };

  return (
    <Container maxWidth="xs">
      <Card sx={{ mb: 2, mt: "100px", minHeight: "450px" }}>
        <CardContent sx={{ alignSelf: "center", mt: 1 }}>
          {accountImported && (
            <Stack sx={{ width: "200px" }}>
              <Button sx={{ mb: 2 }} variant="outlined" onClick={estimateGasPrice}>
                Estimate Gas Price
              </Button>
              <Button sx={{ mb: 2 }} variant="outlined" onClick={estimateMaxGasAmount}>
                Estimate Max Gas Amount
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>
      <Footer />
      <AccountDetailsDialog />
      <ChangePasswordDialog />
      <NetworkDialog />
    </Container>
  );
};

export default Tests;
