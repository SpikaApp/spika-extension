import React, { useContext } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Stack,
  Button,
} from "@mui/material";
import PaletteIcon from "@mui/icons-material/Palette";
import ConstructionIcon from "@mui/icons-material/Construction";
import { UIContext } from "./context/UIContext";
import CreateCollectionDialog from "./components/CreateCollectionDialog";
import CreateNftDialog from "./components/CreateNftDialog";

const NFTs = () => {
  const { handleCreateCollectionUI, handleCreateNFTUI } = useContext(UIContext);
  return (
    <Container maxWidth="xs">
      <Typography variant="h6" align="center" color="textPrimary" gutterBottom>
        <PaletteIcon sx={{ marginTop: 2, fontSize: 48 }} color="primary" />
        <br />
        NFTs
      </Typography>
      <Card>
        <CardContent>
          <Stack direction="row" spacing={2}>
            <Button onClick={handleCreateCollectionUI}>Create collection</Button>
            <Button onClick={handleCreateNFTUI}>Create NFT</Button>
          </Stack>
        </CardContent>
        <CardActions>
          <ConstructionIcon sx={{ fontSize: 72, margingTop: 4 }} color="alt" />
        </CardActions>
      </Card>
      <CreateCollectionDialog />
      <CreateNftDialog />
    </Container>
  );
};

export default NFTs;
