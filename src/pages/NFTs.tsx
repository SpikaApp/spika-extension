import {
  Box,
  Button,
  CircularProgress,
  Container,
  ImageList,
  ImageListItem,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useContext, useEffect, useState } from "react";
import default_nft from "../assets/default_nft.jpg";
import CreateCollectionDialog from "../components/CreateCollectionDialog";
import CreateNftDialog from "../components/CreateNftDialog";
import Footer from "../components/Footer";
import NftDetailsDialog from "../components/NftDetailsDialog";
import { AccountContext } from "../context/AccountContext";
import { UIContext } from "../context/UIContext";
import { Web3Context } from "../context/Web3Context";
import { INftDetails } from "../interface";
import * as nftStore from "../lib/nftStore";

const NftButton = styled(Button)(() => ({
  borderRadius: "8px",
  "&:hover": {
    background: "none",
  },
}));

const NFTs = (): JSX.Element => {
  const { handleCreateCollectionUI, handleCreateNFTUI, handleNftDetailsUI, sendNotification } = useContext(UIContext);
  const { accountImported, currentAddress } = useContext(AccountContext);
  const { getTokenStore, getNftDetails } = useContext(Web3Context);
  const [isLocalLoading, setIsLocalLoading] = useState<boolean>(false);
  const [cacheChecked, setCacheChecked] = useState<boolean>(false);
  const [nfts, setNfts] = useState<Array<INftDetails>>([]);

  useEffect(() => {
    if (accountImported) {
      getCached();
    }
  }, [accountImported]);

  useEffect(() => {
    if (accountImported && cacheChecked) {
      getNftsForAccount();
      const updateNfts = window.setInterval(() => {
        getNftsForAccount();
      }, 60000);
      return () => window.clearInterval(updateNfts);
    }
    return undefined;
  }, [cacheChecked, currentAddress]);

  const getCached = async (): Promise<void> => {
    if (currentAddress) {
      const cached = await nftStore.getNfts(currentAddress);
      if (cached && cached.nfts.length > 0) {
        setNfts(cached.nfts);
      }
      setCacheChecked(true);
    }
  };

  const getNftsForAccount = async (): Promise<void> => {
    let result: Array<INftDetails> = [];
    if (currentAddress) {
      setIsLocalLoading(true);
      const tokens = await getTokenStore();
      if (tokens.length !== 0) result = await getNftDetails(tokens);
      setNfts((nfts) => {
        if (nfts.length !== result.length) {
          sendNotification({ message: "NFTs updated", type: "info", autoHide: true });
        }
        return result;
      });
      nftStore.setNfts(currentAddress, result);
      setIsLocalLoading(false);
    }
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
        <Button sx={{ width: "160px", mr: "2px" }} variant="outlined" onClick={handleCreateCollectionUI}>
          <Typography align="center">Create Collection</Typography>
        </Button>
        <Button sx={{ width: "160px" }} variant="outlined" onClick={handleCreateNFTUI}>
          <Typography align="center">Create NFT</Typography>
        </Button>
      </Stack>
      {isLocalLoading && nfts.length === 0 && (
        <Stack direction="column" sx={{ display: "flex", alignItems: "center", mt: "65px", mb: "256px" }}>
          <Typography align="center" variant="h6" color="textSecondary" gutterBottom>
            Updating metadata...
          </Typography>
          <CircularProgress sx={{ mt: 4 }} color="info" />
        </Stack>
      )}
      {!isLocalLoading && nfts.length === 0 && (
        <Typography sx={{ mt: "65px", mb: "335px" }} variant="h6" align="center" color="textPrimary" gutterBottom>
          No NFTs found
        </Typography>
      )}
      {nfts.length > 0 && (
        <Stack sx={{ display: "flex", alignItems: "center" }}>
          <Box sx={{ height: "340px", mb: "76px" }}>
            <ImageList
              gap={18}
              cols={3}
              rowHeight={101}
              variant="quilted"
              sx={{
                overflow: "hidden",
                overflowY: "visible",
                width: "338px",
                maxHeight: "340px",
              }}
            >
              {nfts.map((nft) => (
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
        </Stack>
      )}
      {accountImported && <Footer />}
      <CreateCollectionDialog />
      <CreateNftDialog />
      <NftDetailsDialog />
    </Container>
  );
};

export default NFTs;
