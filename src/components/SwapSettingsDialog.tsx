/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Chip,
  Typography,
  Box,
  Slider,
  DialogActions,
} from "@mui/material";
import { useContext } from "react";
import { DexContext } from "../context/DexContext";
import { UIContext } from "../context/UIContext";

const SwapSettingsDialog = (): JSX.Element => {
  const { openSwapSettingsDialog, setOpenSwapSettingsDialog } = useContext(UIContext);
  const { slippage, setSlippage, transactionTimeout, setTransactionTimeout, maxGasAmount, setMaxGasAmount } =
    useContext(DexContext);

  const handleSetSlippage = (value: string): void => {
    setSlippage(value);
  };

  const handleCancel = (): void => {
    setOpenSwapSettingsDialog(false);
  };

  return (
    <Dialog open={openSwapSettingsDialog} onClose={handleCancel}>
      <DialogTitle>
        <Stack sx={{ display: "flex", alignItems: "center" }}>Swap Settings</Stack>
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: "12px" }} align="center">
          Slippage
        </Typography>
        <Stack direction="row" sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: "12px" }}>
          <Chip sx={{ width: "60px", mr: "24px" }} label={"0.5%"} onClick={() => handleSetSlippage("0.5")} />
          <Chip sx={{ width: "60px", mr: "24px" }} label={"1%"} onClick={() => handleSetSlippage("1")} />
          <Chip sx={{ width: "60px" }} label={"2%"} onClick={() => handleSetSlippage("2")} />
        </Stack>
        <Stack
          component="span"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            maxWidth: "300px",
          }}
        >
          <Typography align="center" sx={{ mt: "12px", mb: "6px" }}>
            Custom Slippage
          </Typography>
          <Box width={250}>
            <Slider
              key={slippage}
              sx={{ mb: "12px" }}
              size="medium"
              draggable={true}
              defaultValue={Number(slippage)}
              step={0.5}
              min={0.5}
              max={5}
              marks
              valueLabelDisplay="auto"
              onChangeCommitted={(_event, value) => setSlippage(value.toString())}
            />
          </Box>
          <Typography align="center" sx={{ mt: "12px", mb: "6px" }}>
            Transaction Timeout
          </Typography>
          <Box width={250}>
            <Slider
              key={transactionTimeout}
              sx={{ mb: "12px" }}
              size="medium"
              draggable={true}
              defaultValue={Number(transactionTimeout)}
              step={10}
              min={10}
              max={60}
              marks
              valueLabelDisplay="auto"
              onChangeCommitted={(_event, value) => setTransactionTimeout(value.toString())}
            />
          </Box>
          <TextField
            sx={{ mt: 1.5, mb: 1.5, width: "275px" }}
            label="Max Gas Amount"
            type="string"
            value={maxGasAmount}
            onChange={(e) => setMaxGasAmount(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SwapSettingsDialog;
