import { useContext, useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
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
      <Card sx={{ mb: 2, mt: "100px" }}>
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
              label="New password"
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
                href="https://docs.spika.app/terms-and-conditions/license"
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
      </Card>
      <Stack sx={{ display: "flex", alignItems: "center" }}>
        {checkedLicenseRules ? (
          <Button
            variant="contained"
            sx={{
              background: "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);",
              width: "191px",
            }}
            onClick={handleImport}
          >
            Import Account
          </Button>
        ) : (
          <Button variant="contained" sx={{ width: "191px" }} disabled>
            Import Account
          </Button>
        )}
      </Stack>
    </Container>
  );
};

export default Import;
