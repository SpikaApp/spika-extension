import { useContext, useState, useEffect } from "react";
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

  useEffect(() => {
    setPassword("");
    setConfirmPassword("");
  }, []);

  const handleChangeLicenseRules = (event) => {
    setCheckedLicenseRules(event.target.checked);
  };

  return (
    <Container maxWidth="xs">
      <Typography sx={{ mt: 3 }} variant="h6" align="center" color="textPrimary" gutterBottom>
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
              sx={{ mt: 2 }}
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

        <FormControlLabel
          sx={{ mb: 2 }}
          label={
            <Typography>
              I accept the license{" "}
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
        <CardActions>
          {checkedLicenseRules ? (
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
    </Container>
  );
};

export default Import;
