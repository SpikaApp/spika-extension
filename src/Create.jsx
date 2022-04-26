import React, { useContext } from "react";

import { Container, Typography, Card, CardActions, CardContent, Button, TextField } from "@mui/material";

import InfoIcon from "@mui/icons-material/Info";
import PostAddIcon from "@mui/icons-material/PostAdd";

import AlertDialog from "./components/AlertDialog";
import Loading from "./components/Loading";
import { AccountContext } from "./context/AccountContext";

const Create = () => {
  const { mnemonic, setMnemonic, handleGenerate, handleCreate } = useContext(AccountContext);

  return (
    <Container maxWidth="xs">
      <Typography variant="h6" align="center" color="textPrimary" gutterBottom>
        <PostAddIcon sx={{ marginTop: 2, fontSize: 48 }} color="primary" />
        <br />
        Create New Account
      </Typography>
      <Card>
        {mnemonic === "" ? (
          <CardContent>
            <Typography variant="body1" align="center" color="textSecondary" gutterBottom>
              <InfoIcon color="primary" />
              <br />
              First, let's generate new mnemonic phrase. Make sure to write down all words in correct order and store it
              in a safe place. Remember, mnemonic phrase is a key to your account!
            </Typography>
          </CardContent>
        ) : (
          <CardContent>
            <TextField
              id="standard-multiline-static"
              label="Mnemonic phrase"
              margin="normal"
              autoFocus={true}
              multiline
              rows={6}
              variant="outlined"
              value={mnemonic}
            />
          </CardContent>
        )}

        {mnemonic === "" ? (
          <CardActions>
            <Button variant="outlined" onClick={handleGenerate}>
              Generate Mnemonic
            </Button>
          </CardActions>
        ) : (
          <CardActions>
            <Button variant="contained" onClick={handleCreate}>
              Create Account
            </Button>
          </CardActions>
        )}
      </Card>
      <Loading />
      <AlertDialog />
    </Container>
  );
};

export default Create;
