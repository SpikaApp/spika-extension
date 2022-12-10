/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useContext } from "react";
import { DexContext } from "../context/DexContext";
import { UIContext } from "../context/UIContext";
import { DEFAULT_MAX_GAS } from "../utils/constants";

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
        <Stack sx={{ width: "275px", maxWidth: "275px" }}>
          <Typography align="center" sx={{ mb: "12px", fontWeight: "450", fontSize: "16px" }}>
            Slippage Tolerance
          </Typography>
          <Stack direction="row" sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: "24px" }}>
            <Chip sx={{ width: "60px", mr: "24px" }} label={"0.5 %"} onClick={() => handleSetSlippage("0.5")} />
            <Chip sx={{ width: "60px", mr: "24px" }} label={"1 %"} onClick={() => handleSetSlippage("1")} />
            <Chip sx={{ width: "60px" }} label={"2 %"} onClick={() => handleSetSlippage("2")} />
          </Stack>
          <Stack
            component="span"
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "95%",
            }}
          >
            <Box width={250}>
              <Slider
                key={slippage}
                sx={{ mb: "12px", ml: "5px" }}
                size="medium"
                draggable={true}
                defaultValue={Number(slippage)}
                step={0.5}
                min={0.5}
                max={5}
                marks
                valueLabelFormat={(value) => <div>{`${value} %`}</div>}
                valueLabelDisplay="auto"
                onChangeCommitted={(_event, value) => setSlippage(value.toString())}
              />
            </Box>
            <Typography align="center" sx={{ mt: "12px", mb: "6px", fontWeight: "450", fontSize: "16px" }}>
              Transaction Timeout
            </Typography>
            <Box width={250}>
              <Slider
                key={transactionTimeout}
                sx={{ mb: "12px", ml: "5px" }}
                size="medium"
                draggable={true}
                defaultValue={Number(transactionTimeout)}
                step={10}
                min={10}
                max={60}
                marks
                valueLabelFormat={(value) => <div>{`${value} secs`}</div>}
                valueLabelDisplay="auto"
                onChangeCommitted={(_event, value) => setTransactionTimeout(value.toString())}
              />
            </Box>
            <Typography align="center" sx={{ mt: "12px", mb: "6px", fontWeight: "450", fontSize: "16px" }}>
              Max Gas Amount
            </Typography>
            <TextField
              sx={{ mt: 1.5, mb: 1.5, width: "230px" }}
              type="string"
              label="Gas Units"
              fullWidth={false}
              InputLabelProps={{ shrink: true }}
              value={maxGasAmount === DEFAULT_MAX_GAS ? "" : maxGasAmount}
              placeholder={maxGasAmount === DEFAULT_MAX_GAS ? "20000 (default)" : maxGasAmount}
              inputProps={{ style: { textAlign: "right" } }}
              onChange={(e) => setMaxGasAmount(e.target.value)}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SwapSettingsDialog;
