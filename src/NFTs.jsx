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
} from "@mui/material";
import PaletteIcon from "@mui/icons-material/Palette";
import ConstructionIcon from "@mui/icons-material/Construction";
import { UIContext } from "./context/UIContext";
import { AccountContext } from "./context/AccountContext";
import CreateCollectionDialog from "./components/CreateCollectionDialog";
import CreateNftDialog from "./components/CreateNftDialog";
import emptyNft from "./assets/emptyNft.jpg";

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
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ minHeight: 300 }}>
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
            <Button onClick={handleCreateCollectionUI}>Create collection</Button>
            <Button onClick={handleCreateNFTUI}>Create NFT</Button>
          </Stack>
          {isWaiting && (
            <Stack direction="column" sx={{ display: "flex", alignItems: "center", mt: 4 }}>
              <Typography align="center" color="textSecondary" gutterBottom>
                Pulling metadata...
              </Typography>
              <CircularProgress sx={{ mt: 4 }} color="info" />
            </Stack>
          )}
          {accountTokens === 0 ? (
            <Typography sx={{ mt: 4 }} align="center" color="textPrimary" gutterBottom>
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
                  <ImageListItem key={nft.name}>
                    <img
                      src={`${nft.uri}`}
                      onError={({ currentTarget }) => {
                        currentTarget.onerror = null; // prevents looping
                        currentTarget.src = emptyNft;
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
