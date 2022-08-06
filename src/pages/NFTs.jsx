import React, { useContext, useEffect, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Stack,
  Button,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  CircularProgress,
  Divider,
  Box,
} from "@mui/material";
import PaletteIcon from "@mui/icons-material/Palette";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";
import CreateCollectionDialog from "../components/CreateCollectionDialog";
import CreateNftDialog from "../components/CreateNftDialog";
import default_nft from "../assets/default_nft.jpg";

const NFTs = () => {
  const { handleCreateCollectionUI, handleCreateNFTUI } = useContext(UIContext);
  const { accountImported, getAccountTokens, getNftDetails, accountTokens, nftDetails } =
    useContext(AccountContext);
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
      <Typography variant="h6" align="center" color="textPrimary" gutterBottom>
        <PaletteIcon sx={{ marginTop: 2, fontSize: 48 }} color="primary" />
        <br />
        NFTs
      </Typography>
      <Card sx={{ mb: 2, minHeight: 350 }}>
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
          >
            <Stack direction="row" sx={{ mt: 1 }}>
              <Button
                sx={{ width: 180, mr: 2 }}
                variant="outlined"
                onClick={handleCreateCollectionUI}
              >
                <Typography align="center">NEW COLLECTION</Typography>
              </Button>
              <Button sx={{ width: 120 }} variant="outlined" onClick={handleCreateNFTUI}>
                <Typography align="center">New NFT</Typography>
              </Button>
            </Stack>
          </Stack>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-around" }}>
            <Divider sx={{ mt: 2, width: 320 }} />
          </Box>
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
            <Stack sx={{ maxWidth: 350 }}>
              <ImageList
                gap={10}
                variant="masonry"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
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
