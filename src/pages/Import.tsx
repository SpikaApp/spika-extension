import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  Input,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { passwordStrength } from "check-password-strength";
import { useContext, useEffect, useState } from "react";
import { AccountContext } from "../context/AccountContext";
import { createEmptyMnemonicObject, IMnemonicWord, mnemonicToString } from "../utils/normalizeMnemonic";

type ImportSteps = "mnemonic" | "password";
type PasswordStrengthIncludes = "lowercase" | "uppercase" | "symbol" | "number";
type PasswordStrengthColorCode = "error" | "warning" | "success";

interface IPasswordStatus {
  id: number;
  value: string;
  length: string;
  contains: Array<PasswordStrengthIncludes>;
  colorCode: PasswordStrengthColorCode;
}

const Import = (): JSX.Element => {
  const { setMnemonic, handleImport, password, setPassword, confirmPassword, setConfirmPassword } =
    useContext(AccountContext);
  const [step, setStep] = useState<ImportSteps>("mnemonic");
  const [checkedLicenseRules, setCheckedLicenseRules] = useState<boolean>(false);
  const [mnemonicObject, setMnemonicObject] = useState<Array<IMnemonicWord>>(createEmptyMnemonicObject());
  const [mnemonicValidated, setMnemonicValidated] = useState<boolean>(false);
  const [mnemonicError, setMnemonicError] = useState<boolean>(false);
  const [passwordStatus, setPasswordStatus] = useState<IPasswordStatus | undefined>(undefined);
  const [passwordValidated, setPasswordValidated] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<boolean>(false);

  // Reset state.
  useEffect(() => {
    setPassword("");
    setConfirmPassword("");
  }, []);

  useEffect(() => {
    const countWords = mnemonicObject.filter((word) => word.value !== "");
    if (countWords.length === 12) {
      try {
        const mnemonicString = mnemonicToString(mnemonicObject);
        if (mnemonicString) {
          console.log("Valid Mnemonic");
          setMnemonic(mnemonicString);
          setMnemonicValidated(true);
          setMnemonicError(false);
        } else {
          setMnemonicValidated(false);
          setMnemonicError(true);
        }
      } catch (error) {
        setMnemonicValidated(false);
        setMnemonicError(true);
      }
    } else {
      setMnemonicValidated(false);
      setMnemonicError(false);
    }
  }, [mnemonicObject]);

  // Check if entered confirm password matches with password.
  useEffect(() => {
    if (confirmPassword !== "") {
      if (passwordStatus && passwordStatus.id > 1) {
        if (password === confirmPassword) {
          setPasswordValidated(true);
          setPasswordError(false);
        } else {
          setPasswordValidated(false);
          setPasswordError(true);
        }
      } else {
        setPasswordValidated(false);
        setPasswordError(true);
      }
    } else {
      setPasswordValidated(false);
      setPasswordError(true);
    }
  }, [confirmPassword]);

  // Reset confirmPassword if password was changed.
  useEffect(() => {
    if (password) {
      setConfirmPassword("");
    }
  }, [password]);

  // Check password strength and put it in state.
  useEffect(() => {
    if (password !== "") {
      const strength = passwordStrength(password);
      const result: IPasswordStatus = {
        id: strength.id,
        value: strength.value,
        length: strength.value,
        contains: strength.contains,
        colorCode: getPasswordStrengthStatus(strength.id),
      };
      setPasswordStatus(result);
    } else {
      setPasswordStatus(undefined);
    }
  }, [password]);

  const handleEditWord = (_word: IMnemonicWord, value: string): void => {
    const completePhrase = value.split(" ");

    if (completePhrase.length === 12) {
      const pastedPhrase: Array<IMnemonicWord> = [];
      completePhrase.map((word, index) => {
        const result: IMnemonicWord = {
          index: index,
          value: normalizeString(word),
        };
        pastedPhrase.push(result);
      });
      pastedPhrase.sort((a: IMnemonicWord, b: IMnemonicWord) => a.index - b.index);
      setMnemonicObject(pastedPhrase);
      return;
    }
    const data = mnemonicObject.filter((word) => word.index !== _word.index);
    const result: IMnemonicWord = {
      index: _word.index,
      value: normalizeString(value),
    };
    data.push(result);
    data.sort((a: IMnemonicWord, b: IMnemonicWord) => a.index - b.index);
    setMnemonicObject(data);
  };

  const normalizeString = (input: string): string => {
    return input.replace(" ", "");
  };

  const handleChangeLicenseRules = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setCheckedLicenseRules(event.target.checked);
  };

  const getPasswordStrengthStatus = (id: number): PasswordStrengthColorCode => {
    switch (id) {
      case 0: // Too weak
        return "error";
      case 1: // Weak
        return "warning";
      case 2: // Medium
        return "success";
      case 3: // Strong
        return "success";
      default:
        return "error";
    }
  };

  return (
    <Container maxWidth="xs">
      <Card sx={{ mb: 2, mt: "100px" }}>
        {step === "mnemonic" && (
          <div>
            <form className="create-form">
              <input hidden type="text" autoComplete="username" value={undefined}></input>
              <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Box sx={{ border: 2, width: "290px", borderRadius: "12px", py: "6px", px: "10px", mb: "20px" }}>
                  <Typography align="center" color="textSecondary" sx={{ fontSize: "16px", fontWeight: "450" }}>
                    Enter Your Recovery Phrase
                  </Typography>
                </Box>
                <Box sx={{ borderRadius: "12px" }}>
                  <Grid container sx={{ alignItems: "center", justifyContent: "center", width: "300px" }}>
                    {mnemonicObject.map((word) => (
                      <Grid item xs={5.2} key={word.index} sx={{ ml: "8px", mr: "12px" }}>
                        <Stack
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "start",
                            justifyContent: "start",
                          }}
                        >
                          <Typography
                            color="textSecondary"
                            sx={{
                              position: "absolute",
                              mt: "6px",
                              pl: "8px",
                              fontSize: "12px",
                              fontFamily: "monospace",
                              fontWeight: "550",
                            }}
                          >
                            {word.index + 1}.
                          </Typography>

                          <Input
                            sx={{
                              width: "135px",
                              height: "35px",
                              mb: "8px",
                              border: 2,
                              borderColor: "grey",
                              fontSize: "12px",
                              fontWeight: "550",
                              fontFamily: "monospace",
                              py: "2px",
                              pl: "35px",
                              pr: "10px",
                            }}
                            key={word.index}
                            autoFocus={false}
                            autoComplete="off"
                            disableUnderline={true}
                            value={word.value}
                            onChange={(e) => handleEditWord(word, e.target.value)}
                          />
                        </Stack>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
                <Box
                  sx={{
                    height: "30px",
                    width: "90%",
                    mt: "-4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: "-18px",
                  }}
                >
                  {mnemonicError && (
                    <Typography align="center" color="error.main" sx={{ fontSize: "15px", fontWeight: "550" }}>
                      Invalid recovery phrase
                    </Typography>
                  )}
                  {mnemonicValidated && (
                    <Typography align="center" color="success.main" sx={{ fontSize: "15x", fontWeight: "550" }}>
                      Recovery phrase validated
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </form>
            <Stack sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FormControlLabel
                sx={{ mb: 2 }}
                label={
                  <Typography>
                    I accept the license{" "}
                    <Link href="https://docs.spika.app/terms-and-conditions/license" underline="none" target="_blank">
                      {" "}
                      disclaimer
                    </Link>
                  </Typography>
                }
                control={<Checkbox checked={checkedLicenseRules} onChange={handleChangeLicenseRules} />}
              />
            </Stack>
          </div>
        )}
        {step === "password" && (
          <form className="create-form">
            <input hidden type="text" autoComplete="username" value={undefined}></input>
            <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Box sx={{ border: 0, width: "290px", borderRadius: "12px", py: "6px", px: "10px", mb: "12px" }}>
                <Typography align="center" color="textSecondary" sx={{ fontSize: "16px", fontWeight: "450" }}>
                  Recovery phrase successfully validated. Now, let's create strong password to keep your wallet safe.
                </Typography>
              </Box>
              <Box
                sx={{
                  border: 2.5,
                  borderColor: "warning.main",
                  width: "250px",
                  borderRadius: "12px",
                  py: "10px",
                  px: "10px",
                }}
              >
                <Stack sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                  <WarningAmberIcon color="warning" sx={{ mr: "12px" }} />
                  <Typography align="left" color="textSecondary" sx={{ fontSize: "14px", fontWeight: "550" }}>
                    Note: Spika wallet unable to recover lost passwords.
                  </Typography>
                </Stack>
              </Box>
              <Box
                sx={{
                  mt: "35px",
                  border: 0,
                  borderRadius: "12px",
                  width: "100%",
                  height: "178px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "start",
                }}
              >
                <Input
                  sx={{
                    border: 2,
                    borderRadius: "12px",
                    py: "8px",
                    px: "12px",
                    fontSize: "17px",
                    fontWeight: "450",
                  }}
                  type="password"
                  autoFocus={true}
                  autoComplete="new-password"
                  value={password}
                  placeholder={"New password"}
                  disableUnderline={true}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Box
                  sx={{
                    width: "70%",
                    height: "35px",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "start",
                    justifyContent: "center",
                  }}
                >
                  {passwordStatus && (
                    <Typography sx={{ fontSize: "14px", fontWeight: "450" }} color={`${passwordStatus.colorCode}.main`}>
                      {passwordStatus.value} password
                    </Typography>
                  )}
                </Box>
                <Input
                  sx={{
                    border: 2,
                    borderRadius: "12px",
                    py: "8px",
                    px: "12px",
                    fontSize: "17px",
                    fontWeight: "450",
                  }}
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  placeholder={"Confirm password"}
                  disableUnderline={true}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Box
                  sx={{
                    width: "70%",
                    height: "35px",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "start",
                    justifyContent: "center",
                  }}
                >
                  {password !== "" &&
                    password.length === confirmPassword.length &&
                    passwordStatus &&
                    passwordStatus.id > 1 && (
                      <Typography
                        sx={{ fontSize: "14px", fontWeight: "450" }}
                        color={passwordValidated ? "success.main" : "error.main"}
                      >
                        {passwordValidated && "Passwords validated"}
                        {passwordError && "Passwords do not match"}
                      </Typography>
                    )}
                </Box>
              </Box>
            </CardContent>
          </form>
        )}
      </Card>
      <Stack sx={{ display: "flex", alignItems: "center" }}>
        {step === "mnemonic" && (
          <Button
            variant="contained"
            sx={{
              background:
                checkedLicenseRules && mnemonicValidated
                  ? "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);"
                  : "",
              width: "225px",
            }}
            disabled={checkedLicenseRules && mnemonicValidated ? false : true}
            onClick={() => setStep("password")}
          >
            Confirm recovery phrase
          </Button>
        )}
        {step === "password" && (
          <Button
            variant="contained"
            sx={{
              background: passwordValidated ? "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);" : "",
              width: "225px",
            }}
            disabled={passwordValidated ? false : true}
            onClick={handleImport}
          >
            Import account
          </Button>
        )}
      </Stack>
    </Container>
  );
};

export default Import;
