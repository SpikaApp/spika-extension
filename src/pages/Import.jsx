import { useContext, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardActions,
  CardContent,
  Button,
  TextField,
  Stack,
  FormControlLabel,
  Checkbox,
  Link,
} from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import Loading from "../components/Loading";
import { AccountContext } from "../context/AccountContext";

const Import = () => {
  const {
    mnemonic,
    setMnemonic,
    handleImport,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
  } = useContext(AccountContext);
  const [checkedLicenseRules, setCheckedLicenseRules] = useState(false);
  const [checkedPasswordRules, setCheckedPasswordRules] = useState(false);

  const handleChangeLicenseRules = (event) => {
    setCheckedLicenseRules(event.target.checked);
  };

  const handleChangePasswordRules = (event) => {
    setCheckedPasswordRules(event.target.checked);
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h6" align="center" color="textPrimary" gutterBottom>
        <ArticleIcon sx={{ mt: 2, fontSize: 48 }} color="primary" />
        <br />
        Import Account
      </Typography>
      <Card sx={{ mb: 2 }}>
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
              rows={3}
              variant="outlined"
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
            />

            <TextField
              sx={{ mt: 4 }}
              id="password"
              label="New Password"
              type="password"
              autoFocus={false}
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
          </CardContent>
        </form>
        <Stack
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "start",
            ml: 6,
            mr: 6,
            mr: 2,
            mb: 2,
          }}
        >
          <FormControlLabel
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
            control={<Checkbox checked={checkedLicenseRules} onChange={handleChangeLicenseRules} />}
          />
          <FormControlLabel
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "start",
            }}
            label={
              <Typography>
                I understand that forgotten password cannot be recovered by wallet App{" "}
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
        </Stack>
        <CardActions>
          {checkedLicenseRules && checkedPasswordRules ? (
            <Button variant="contained" onClick={handleImport}>
              Import Account
            </Button>
          ) : (
            <Button variant="contained" disabled>
              Import Account
            </Button>
          )}
        </CardActions>
      </Card>
      <Loading />
    </Container>
  );
};

export default Import;
