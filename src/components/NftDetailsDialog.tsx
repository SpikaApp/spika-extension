/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useContext } from "react";
import default_nft from "../assets/default_nft.jpg";
import { AccountContext } from "../context/AccountContext";
import { UIContext } from "../context/UIContext";
import { INftAttributes } from "../interface/INftDetails";
import shortenAddress from "../utils/shortenAddress";

const NftDetailsDialog = (): JSX.Element => {
  const { openNftDetailsDialog, setOpenNftDetailsDialog, selectedNft, setSelectedNft } = useContext(UIContext);
  const { accountImported } = useContext(AccountContext);

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "start",
    color: theme.palette.text.secondary,
  }));

  const handleClose = () => {
    setOpenNftDetailsDialog(false);
    setSelectedNft(undefined);
  };

  const normalizeAttribute = (string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLocaleLowerCase();
  };

  return (
    <Box>
      {accountImported && openNftDetailsDialog && selectedNft && (
        <Dialog open={openNftDetailsDialog} onClose={handleClose}>
          <DialogTitle align="center" sx={{ mb: "-10px" }}>
            <Box sx={{ width: "260px" }}>{selectedNft.name}</Box>
          </DialogTitle>
          <DialogContent sx={{ alignItems: "center", justifyContent: "center" }}>
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ alignSelf: "center" }}>
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
                <Grid item xs={5}>
                  <Typography variant="subtitle2" sx={{ ml: 0.5 }}>
                    Editions
                  </Typography>
                  <Item>
                    <Typography variant="body2" sx={{ textOverflow: "ellipsis", wordWrap: "break-word" }}>
                      {selectedNft.supply}
                    </Typography>
                  </Item>
                </Grid>
                <Grid item xs={7}>
                  <Typography variant="subtitle2" sx={{ ml: 0.5 }}>
                    Creator
                  </Typography>
                  <Tooltip title={selectedNft.creator}>
                    <Item sx={{ cursor: "pointer" }}>{shortenAddress(selectedNft.creator!)}</Item>
                  </Tooltip>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ ml: 0.5 }}>
                    Collection
                  </Typography>
                  <Item>
                    <Typography variant="body2" sx={{ textOverflow: "ellipsis", wordWrap: "break-word" }}>
                      {selectedNft.collection}
                    </Typography>
                  </Item>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ ml: 0.5 }}>
                    Description
                  </Typography>
                  <Item>
                    <Typography variant="body2" sx={{ textOverflow: "ellipsis", wordWrap: "break-word" }}>
                      {selectedNft.description}
                    </Typography>
                  </Item>
                </Grid>
                {selectedNft.attributes && selectedNft.attributes.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ ml: 0.5 }}>
                      Attributes
                    </Typography>
                    {selectedNft.attributes.map((attribute: INftAttributes) => (
                      <Item key={attribute.trait_type} sx={{ mb: "8px" }}>
                        <Typography
                          sx={{
                            textOverflow: "ellipsis",
                            wordWrap: "break-word",
                            fontSize: "12px",
                            fontWeight: "500",
                          }}
                        >
                          {normalizeAttribute(attribute.trait_type)}
                        </Typography>
                        <Typography
                          sx={{
                            textOverflow: "ellipsis",
                            wordWrap: "break-word",
                            fontSize: "12px",
                            fontWeight: "400",
                          }}
                        >
                          {attribute.value}
                        </Typography>
                      </Item>
                    ))}
                  </Grid>
                )}
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default NftDetailsDialog;
