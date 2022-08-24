import React, { useContext, useEffect, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  CardActions,
  Stack,
  Button,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  CircularProgress,
} from "@mui/material";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";
import { Web3Context } from "../context/Web3Context";
import CreateCollectionDialog from "../components/CreateCollectionDialog";
import CreateNftDialog from "../components/CreateNftDialog";
import default_nft from "../assets/default_nft.jpg";

const NFTs = () => {
  const { handleCreateCollectionUI, handleCreateNFTUI } = useContext(UIContext);
  const { accountImported } = useContext(AccountContext);
  const { accountTokens, getAccountTokens, getNftDetails, nftDetails } = useContext(Web3Context);
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    if (accountImported === true) {
      setIsWaiting(true);
      getAccountTokens();
      const updateAccountResources = window.setInterval(() => {
        getAccountTokens();
      }, 30000);
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
          mt: "100px",
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
      <Card sx={{ mb: 2, maxHeight: 400 }}>
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
            <Stack sx={{ maxWidth: "350px" }}>
              <ImageList
                gap={10}
                variant="masonry"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  height: "320px",
                  overflow: "hidden",
                  overflowY: "scroll",
                }}
              >
                {nftDetails.map((nft) => (
                  <ImageListItem key={nft.collection + nft.name + nft.description}>
                    <img
                      src={`${nft.uri}`}
                      onError={({ currentTarget }) => {
                        currentTarget.onerror = null; // prevents looping
                        currentTarget.src = default_nft;
                      }}
                    />
                    <ImageListItemBar
                      title={<span>{nft.name}</span>}
                      subtitle={<span>{nft.collection}</span>}
                      position="bottom"
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </Stack>
          )}
        </CardContent>
        <CardActions></CardActions>
      </Card>
      <CreateCollectionDialog />
      <CreateNftDialog />
    </Container>
  );
};

export default NFTs;
