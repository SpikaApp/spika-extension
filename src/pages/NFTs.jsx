import React, { useContext, useEffect, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  CircularProgress,
  Paper,
} from "@mui/material";
import Footer from "../components/Footer";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";
import { Web3Context } from "../context/Web3Context";
import CreateCollectionDialog from "../components/CreateCollectionDialog";
import CreateNftDialog from "../components/CreateNftDialog";
import NftDetailsDialog from "../components/NftDetailsDialog";
import default_nft from "../assets/default_nft.jpg";

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

  const openNftDetails = (nft) => {
    setOpenNftDetailsDialog(true);
  };

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
      <Card sx={{ mb: 2, minHeight: 400, maxHeight: 400 }}>
        <CardContent>
          <Stack
            direction="row"
            spacing={2}
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          ></Stack>
          {isWaiting && (
            <Stack direction="column" sx={{ display: "flex", alignItems: "center", mt: 8 }}>
              <Typography align="center" variant="h6" color="textSecondary" gutterBottom>
                Pulling metadata...
              </Typography>
              <CircularProgress sx={{ mt: 4 }} color="info" />
            </Stack>
          )}
          {accountTokens === 0 ? (
            <Typography sx={{ mt: 8 }} variant="h6" align="center" color="textPrimary" gutterBottom>
              No NFTs found
            </Typography>
          ) : (
            <ImageList
              gap={10}
              variant="standard"
              sx={{
                width: "260px",
                height: "385px",
                overflow: "hidden",
                overflowY: "scroll",
                alignItems: "",
                justifyContent: "center",
                mt: "-8.5px",
              }}
            >
              {nftDetails.map((nft) => (
                <Button
                  key={nft.name + nft.description + nft.uri}
                  sx={{ width: "125px", height: "120px" }}
                  onClick={() => handleNftDetailsUI(nft)}
                >
                  <ImageListItem>
                    <Paper
                      component="img"
                      sx={{ width: "125px", height: "120px" }}
                      src={`${nft.uri}`}
                      onError={({ currentTarget }) => {
                        currentTarget.onerror = null; // prevents looping
                        currentTarget.src = default_nft;
                      }}
                    />
                    <ImageListItemBar
                      align="center"
                      title={
                        <Typography variant="inherit" sx={{ fontSize: "12px" }}>
                          {nft.name}
                        </Typography>
                      }
                      // subtitle={<span>{nft.collection}</span>}
                      position="bottom"
                      sx={{
                        height: "28px",
                        borderBottomLeftRadius: "8px",
                        borderBottomRightRadius: "8px",
                      }}
                    />
                  </ImageListItem>
                </Button>
              ))}
            </ImageList>
          )}
        </CardContent>
      </Card>
      <Footer />
      <CreateCollectionDialog />
      <CreateNftDialog />
      <NftDetailsDialog />
    </Container>
  );
};

export default NFTs;
