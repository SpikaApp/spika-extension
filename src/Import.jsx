import { useContext } from "react";
import { Container, Typography, Card, CardActions, CardContent, Button, TextField } from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import Loading from "./components/Loading";
import { AccountContext } from "./context/AccountContext";

const Import = () => {
  const { mnemonic, setMnemonic, handleImport, password, setPassword, confirmPassword, setConfirmPassword } =
    useContext(AccountContext);

  return (
    <Container maxWidth="xs">
      <Typography variant="h6" align="center" color="textPrimary" gutterBottom>
        <ArticleIcon sx={{ marginTop: 2, fontSize: 48 }} color="primary" />
        <br />
        Import Account
      </Typography>
      <Card>
        <form className="import-form">
          <input hidden type="text" autoComplete="username" value={undefined}></input>
          <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <TextField
              id="standard-multiline-static"
              label="Enter mnemonic phrase"
              margin="normal"
              autoFocus={true}
              autoComplete="off"
              multiline
              rows={6}
              variant="outlined"
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
            />
            <TextField
              sx={{ marginTop: 4 }}
              id="password"
              label="Password"
              type="password"
              autoFocus={true}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              sx={{ marginTop: 2, marginBottom: 2 }}
              id="confirmPassword"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </CardContent>
        </form>
        <CardActions>
          <Button variant="contained" onClick={handleImport}>
            IMPORT
          </Button>
        </CardActions>
      </Card>
      <Loading />
    </Container>
  );
};

export default Import;
