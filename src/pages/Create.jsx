import React, { useContext, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardActions,
  CardContent,
  Button,
  TextField,
  Stack,
  Checkbox,
  FormControlLabel,
  Link,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import PostAddIcon from "@mui/icons-material/PostAdd";

import Loading from "../components/Loading";
import { AccountContext } from "../context/AccountContext";

const Create = () => {
  const {
    newMnemonic,
    handleGenerate,
    handleCreate,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
  } = useContext(AccountContext);
  const [checkedLicenseRules, setCheckedLicenseRules] = useState(false);
  const [checkedMnemonicRules, setCheckedMnemonicRules] = useState(false);
  const [checkedPasswordRules, setCheckedPasswordRules] = useState(false);

  const handleChangeLicenseRules = (event) => {
    setCheckedLicenseRules(event.target.checked);
  };

  const handleChangeMnemonicRules = (event) => {
    setCheckedMnemonicRules(event.target.checked);
  };

  const handleChangePasswordRules = (event) => {
    setCheckedPasswordRules(event.target.checked);
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h6" align="center" color="textPrimary" gutterBottom>
        <PostAddIcon sx={{ marginTop: 2, fontSize: 48 }} color="primary" />
        <br />
        Create New Account
      </Typography>
      <Card sx={{ mb: 2 }}>
        {newMnemonic === "" ? (
          <CardContent>
            <Typography variant="body1" align="center" color="textSecondary" gutterBottom>
              <InfoIcon color="primary" />
              <br />
              First, let's generate new mnemonic phrase. Make sure to write down all words in
              correct order and store it in a safe place. Remember, mnemonic phrase is a key to your
              account.
            </Typography>
            <Stack sx={{ display: "flex", alignItems: "center" }}>
              <FormControlLabel
                sx={{ mt: 4 }}
                label={
                  <Typography>
                    I agree and accept license{" "}
                    <Link
                      href="https://github.com/xorgal/spika/blob/master/LICENSE"
                      underline="none"
                      target="_blank"
                    >
                      {" "}
                      disclaimer
                    </Link>
                  </Typography>
                }
                control={
                  <Checkbox
                    sx={{ my: -1 }}
                    checked={checkedLicenseRules}
                    onChange={handleChangeLicenseRules}
                  />
                }
              />
            </Stack>
          </CardContent>
        ) : (
          <form className="create-form">
            <input hidden type="text" autoComplete="username" value={undefined}></input>
            <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <TextField
                id="newMnemonic"
                label="Mnemonic phrase"
                margin="normal"
                autoFocus={false}
                autoComplete="off"
                multiline
                rows={3}
                variant="outlined"
                value={newMnemonic}
              />
              <FormControlLabel
                sx={{ ml: 3, mr: 4.5 }}
                label="I have saved my mnemonic phrase"
                control={
                  <Checkbox checked={checkedMnemonicRules} onChange={handleChangeMnemonicRules} />
                }
              />
              <TextField
                sx={{ mt: 2 }}
                id="password"
                label="New Password"
                type="password"
                autoFocus={true}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <TextField
                sx={{ mt: 2 }}
                id="confirmPassword"
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <FormControlLabel
                sx={{
                  ml: 3,
                  mr: 4.5,
                  mt: 2,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "start",
                }}
                label={
                  <Typography>
                    I understand that forgotten password cannot be recovered by wallet App
                  </Typography>
                }
                control={
                  <Checkbox
                    sx={{ my: -1 }}
                    checked={checkedPasswordRules}
                    onChange={handleChangePasswordRules}
                  />
                }
              />
            </CardContent>
          </form>
        )}

        {newMnemonic === "" ? (
          <CardActions>
            {checkedLicenseRules ? (
              <Button variant="contained" onClick={handleGenerate}>
                Generate Mnemonic
              </Button>
            ) : (
              <Button variant="contained" disabled>
                Generate Mnemonic
              </Button>
            )}
          </CardActions>
        ) : (
          <CardActions>
            {checkedMnemonicRules && checkedPasswordRules ? (
              <Button variant="contained" onClick={handleCreate}>
                Create Account
              </Button>
            ) : (
              <Button variant="contained" disabled>
                Create Account
              </Button>
            )}
          </CardActions>
        )}
      </Card>
      <Loading />
    </Container>
  );
};

export default Create;
