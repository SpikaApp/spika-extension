import { useContext } from "react";
import { Container, Typography, Card, CardActions, CardContent, Button, TextField } from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import AlertDialog from "./components/AlertDialog";
import Loading from "./components/Loading";
import { AccountContext } from "./context/AccountContext";

const Import = () => {
  const { mnemonic, setMnemonic, handleImport } = useContext(AccountContext);

  return (
    <Container maxWidth="xs">
      <Typography variant="h6" align="center" color="textPrimary" gutterBottom>
        <ArticleIcon sx={{ marginTop: 2, fontSize: 48 }} color="primary" />
        <br />
        Import Account
      </Typography>
      <Card>
        <CardContent>
          <TextField
            id="standard-multiline-static"
            label="Enter your mnemonic phrase"
            margin="normal"
            autoFocus={true}
            multiline
            rows={6}
            variant="outlined"
            value={mnemonic}
            onChange={(e) => setMnemonic(e.target.value)}
          />
        </CardContent>
        <CardActions>
          <Button variant="contained" onClick={handleImport}>
            IMPORT
          </Button>
        </CardActions>
      </Card>
      <Loading />
      <AlertDialog />
    </Container>
  );
};

export default Import;
