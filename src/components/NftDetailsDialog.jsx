import React, { useContext } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
  Grid,
  Box,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { UIContext } from "../context/UIContext";
import default_nft from "../assets/default_nft.jpg";

const NftDetailsDialog = () => {
  const { openNftDetailsDialog, setOpenNftDetailsDialog, selectedNft, setSelectedNft } =
    useContext(UIContext);

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "start",
    color: theme.palette.text.secondary,
  }));

  const handleClose = () => {
    setOpenNftDetailsDialog(false);
    setSelectedNft([]);
  };

  return (
    <Dialog open={openNftDetailsDialog} onClose={handleClose}>
      <DialogTitle align="center">
        <Box sx={{ width: "260px" }}>{selectedNft.name}</Box>
      </DialogTitle>
      <DialogContent sx={{ alignItems: "center", justifyContent: "center" }}>
        <Box sx={{ flexGrow: 1 }}>
          <Box align="center">
            <Paper
              component="img"
              src={selectedNft.uri}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null; // prevents looping
                currentTarget.src = default_nft;
              }}
              sx={{
                maxWidth: "260px",
                maxHeight: "260px",
              }}
            />
          </Box>
          <Grid sx={{ width: "266px" }} container spacing={1}>
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Item>{selectedNft.description}</Item>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" sx={{ ml: 0.5 }}>
                Editions
              </Typography>
              <Item>{selectedNft.supply}</Item>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default NftDetailsDialog;
