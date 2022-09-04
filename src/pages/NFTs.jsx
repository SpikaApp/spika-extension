import React, { useContext, useEffect, useState } from "react";
import {
  Container,
  Typography,
  Stack,
  Button,
  ImageList,
  ImageListItem,
  CircularProgress,
  Paper,
  Box,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Footer from "../components/Footer";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";
import { Web3Context } from "../context/Web3Context";
import CreateCollectionDialog from "../components/CreateCollectionDialog";
import CreateNftDialog from "../components/CreateNftDialog";
import NftDetailsDialog from "../components/NftDetailsDialog";
import default_nft from "../assets/default_nft.jpg";

const NftButton = styled(Button)(() => ({
  borderRadius: "8px",
  "&:hover": {
    background: "none",
  },
}));

const NFTs = () => {
  const { handleCreateCollectionUI, handleCreateNFTUI, handleNftDetailsUI } = useContext(UIContext);
  const { accountImported } = useContext(AccountContext);
  const { accountTokens, getAccountTokens, getNftDetails, nftDetails } = useContext(Web3Context);
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    if (accountImported === true) {
      setIsWaiting(true);
      getAccountTokens();
      const updateAccountResources = window.setInterval(() => {
        getAccountTokens();
      }, 60000);
      return () => window.clearInterval(updateAccountResources);
    }
    return undefined;
  }, [accountImported]);

  useEffect(() => {
    if (accountImported && accountTokens.length > 0) {
      getNftDetails();
      setIsWaiting(false);
    } else if (accountTokens === 0) {
      setIsWaiting(false);
    }
  }, [accountTokens]);

  return (
    <Container maxWidth="xs">
      <Stack
        sx={{
          mt: "90px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        <Button
          sx={{ width: "160px", mr: 2 }}
          variant="outlined"
          onClick={handleCreateCollectionUI}
        >
          <Typography align="center">Create Collection</Typography>
        </Button>
        <Button sx={{ width: "160px" }} variant="outlined" onClick={handleCreateNFTUI}>
          <Typography align="center">Create NFT</Typography>
        </Button>
      </Stack>
      {isWaiting === true && accountImported && (
        <Stack
          direction="column"
          sx={{ display: "flex", alignItems: "center", mt: 8, mb: "257px" }}
        >
          <Typography align="center" variant="h6" color="textSecondary" gutterBottom>
            Updating metadata...
          </Typography>
          <CircularProgress sx={{ mt: 4 }} color="info" />
        </Stack>
      )}
      {accountTokens === 0 && isWaiting === false && (
        <Typography
          sx={{ mt: 8, mb: "336px" }}
          variant="h6"
          align="center"
          color="textPrimary"
          gutterBottom
        >
          No NFTs found
        </Typography>
      )}
      {accountTokens !== 0 && !isWaiting && accountImported && (
        <Box align="center" sx={{ height: "400px" }}>
          <ImageList
            gap={18}
            cols={3}
            rowHeight={101}
            variant="quilted"
            sx={{
              overflow: "hidden",
              overflowY: "visible",
              width: "335px",
              maxHeight: "385px",
            }}
          >
            {nftDetails.map((nft) => (
              <ImageListItem key={nft.name + nft.description + nft.uri}>
                <Tooltip title={nft.name}>
                  <NftButton
                    disableRipple
                    sx={{ width: "100px", height: "100px" }}
                    onClick={() => handleNftDetailsUI(nft)}
                  >
                    <Paper
                      component="img"
                      sx={{ width: "100px", height: "100px" }}
                      src={`${nft.uri}`}
                      loading="lazy"
                      onError={({ currentTarget }) => {
                        currentTarget.onerror = null; // prevents looping
                        currentTarget.src = default_nft;
                      }}
                    />
                  </NftButton>
                </Tooltip>
              </ImageListItem>
            ))}
          </ImageList>
        </Box>
      )}
      {accountImported && <Footer />}
      <CreateCollectionDialog />
      <CreateNftDialog />
      <NftDetailsDialog />
    </Container>
  );
};

export default NFTs;
