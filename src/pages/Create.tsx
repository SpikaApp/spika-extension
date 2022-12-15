import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import InfoIcon from "@mui/icons-material/Info";
import ReplyIcon from "@mui/icons-material/Reply";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  Input,
  Link,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { validateMnemonic } from "@scure/bip39";
import * as english from "@scure/bip39/wordlists/english";
import { passwordStrength } from "check-password-strength";
import { useContext, useEffect, useState } from "react";
import { AccountContext } from "../context/AccountContext";
import { UIContext } from "../context/UIContext";
import errorParser from "../lib/errorParser";
import { PLATFORM } from "../utils/constants";
import copyToClipboard from "../utils/copyToClipboard";
import { IMnemonicWord, mnemonicToString, normalizeMnemonic } from "../utils/normalizeMnemonic";

type Steps = "generate" | "save" | "confirm" | "create";

type PasswordStrengthIncludes = "lowercase" | "uppercase" | "symbol" | "number";
type PasswordStrengthColorCode = "error" | "warning" | "success";

interface IPasswordStatus {
  id: number;
  value: string;
  length: string;
  contains: Array<PasswordStrengthIncludes>;
  colorCode: PasswordStrengthColorCode;
}

const Create = (): JSX.Element => {
  // Context: UIContext, AccountContext
  const { sendNotification } = useContext(UIContext);
  const { newMnemonic, handleGenerate, handleCreate, password, setPassword, confirmPassword, setConfirmPassword } =
    useContext(AccountContext);

  // Page states.
  const [step, setStep] = useState<Steps>("generate");
  const [normalized, setNormalized] = useState<Array<IMnemonicWord>>([]);
  const [checkedLicenseRules, setCheckedLicenseRules] = useState<boolean>(false);
  const [checkedRevealMnemonic, setCheckedRevealMnemonic] = useState<boolean>(false);
  const [checkedAllWordsSaved, setCheckedAllWordsSaved] = useState<boolean>(false);
  const [allWordsComplete, setAllWordsComplete] = useState<boolean>(false);
  const [mnemonicValidated, setMnemonicValidated] = useState<boolean>(false);
  const [passwordStatus, setPasswordStatus] = useState<IPasswordStatus | undefined>(undefined);
  const [passwordValidated, setPasswordValidated] = useState<boolean>(false);
  const [userConfirmedMnemonic, setUserConfirmedMnemonic] = useState<Array<IMnemonicWord>>(() => {
    const result: Array<IMnemonicWord> = [];
    for (let i = 0; i < 12; i++) {
      const data: IMnemonicWord = {
        index: i,
        value: "",
      };
      result.push(data);
    }
    return result;
  });

  // Page errors.
  const [mnemonicError, setMnemonicError] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<boolean>(false);

  // Reset state on first render.
  useEffect(() => {
    setPassword("");
    setConfirmPassword("");
  }, []);

  // Convert mnemonic to Array<IMnemonicWord>.
  useEffect(() => {
    if (newMnemonic) {
      setNormalized(normalizeMnemonic(newMnemonic));
    }
  }, [newMnemonic]);

  // Check if User has entered all 12 words.
  useEffect(() => {
    const data = userConfirmedMnemonic.filter((word) => word.value !== "");

    if (data.length === 12) {
      setAllWordsComplete(true);
    } else {
      setAllWordsComplete(false);
    }
  }, [userConfirmedMnemonic]);

  // Check if entered mnemonic matches with generated one.
  useEffect(() => {
    if (allWordsComplete) {
      try {
        const mnemonicString = mnemonicToString(userConfirmedMnemonic);
        if (mnemonicString === newMnemonic) {
          setMnemonicError(false);
          setMnemonicValidated(true);
        } else {
          setMnemonicError(true);
          setMnemonicValidated(false);
        }
      } catch (error) {
        setMnemonicError(true);
        setMnemonicValidated(false);
      }
    }
  }, [allWordsComplete, userConfirmedMnemonic]);

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

  const handleCheckLicenseRules = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setCheckedLicenseRules(event.target.checked);
  };

  const handleCheckRevealMnemonic = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setCheckedRevealMnemonic(event.target.checked);
  };
  const handleCheckAllWordsSaved = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setCheckedAllWordsSaved(event.target.checked);
  };

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
      setUserConfirmedMnemonic(pastedPhrase);
      return;
    }
    const data = userConfirmedMnemonic.filter((word) => word.index !== _word.index);
    const result: IMnemonicWord = {
      index: _word.index,
      value: normalizeString(value),
    };
    data.push(result);
    data.sort((a: IMnemonicWord, b: IMnemonicWord) => a.index - b.index);
    setUserConfirmedMnemonic(data);
  };

  const handleCopyToClipboard = async (content: string): Promise<void> => {
    copyToClipboard(content);
  };

  const handlePasteFromClipboard = async (): Promise<void> => {
    try {
      let data: string;
      if (PLATFORM === "chrome-extension:") {
        data = newMnemonic;
      } else {
        data = await navigator.clipboard.readText();
      }
      const result = getMnemonicFromString(data);
      if (result) {
        setUserConfirmedMnemonic(result);
      } else {
        sendNotification({ message: "Invalid clipboard content", type: "error", autoHide: true });
      }
    } catch (error) {
      sendNotification({ message: errorParser(error, "Error reading content"), type: "error", autoHide: true });
    }
  };

  const getMnemonicFromString = (mnemonic: string): Array<IMnemonicWord> | undefined => {
    const validated = validateMnemonic(mnemonic, english.wordlist);

    if (validated) {
      const data = mnemonic.split(" ");
      const result: Array<IMnemonicWord> = [];
      data.map((word: string, index: number) => {
        const mnemonicWord: IMnemonicWord = {
          index: index,
          value: word,
        };
        result.push(mnemonicWord);
      });
      return result;
    } else {
      sendNotification({ message: "Invalid recovery phrase", type: "error", autoHide: true });
      return undefined;
    }
  };

  const normalizeString = (input: string): string => {
    return input.replace(" ", "");
  };

  return (
    <Container maxWidth="xs">
      <Card sx={{ mb: 2, mt: "100px" }}>
        {step === "generate" && (
          <CardContent>
            <Typography align="center" color="textSecondary" sx={{ fontSize: "16px", fontWeight: "450" }} gutterBottom>
              <InfoIcon color="primary" />
              <br />
              First, let's generate new recovery phrase. Make sure to write down all words in correct order and store it
              in a safe place. Remember, recovery phrase is a key to all your accounts.
            </Typography>
            <Stack sx={{ display: "flex", alignItems: "center" }}>
              <FormControlLabel
                sx={{ mt: 4 }}
                label={
                  <Typography>
                    I accept the license{" "}
                    <Link
                      href="https://docs.spika.app/terms-and-conditions/license"
                      underline="none"
                      target="_blank"
                      color="link"
                    >
                      {" "}
                      disclaimer
                    </Link>{" "}
                  </Typography>
                }
                control={<Checkbox sx={{ my: -1 }} checked={checkedLicenseRules} onChange={handleCheckLicenseRules} />}
              />
            </Stack>
          </CardContent>
        )}

        {step === "save" && (
          <form className="create-form">
            <input hidden type="text" autoComplete="username" value={undefined}></input>
            <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Box sx={{ border: 2, width: "290px", borderRadius: "12px", py: "6px", px: "10px" }}>
                <Typography align="center" color="textSecondary" sx={{ fontSize: "16px", fontWeight: "450" }}>
                  Your Recovery Phrase Ready
                </Typography>
              </Box>
              <Tooltip title="Copy to clipboard">
                <IconButton sx={{ mt: "6px", mb: "6px" }} onClick={() => handleCopyToClipboard(newMnemonic)}>
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
              <Box sx={{ borderRadius: "12px" }}>
                <Grid container sx={{ alignItems: "center", justifyContent: "center", width: "300px" }}>
                  {normalized.map((word) => (
                    <Grid item xs={5.2} key={word.index} sx={{ ml: "8px", mr: "12px" }}>
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
                          px: "10px",
                        }}
                        key={word.index}
                        autoFocus={false}
                        autoComplete="off"
                        disableUnderline={true}
                        value={`${word.index + 1}. ${!checkedRevealMnemonic ? "* * *" : word.value}`}
                      />
                    </Grid>
                  ))}
                </Grid>
                <Stack>
                  <FormGroup
                    sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}
                  >
                    <FormControlLabel
                      sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: "-15px", ml: "10px" }}
                      control={<Checkbox checked={checkedRevealMnemonic} onChange={handleCheckRevealMnemonic} />}
                      label={
                        <Typography color="textSecondary" sx={{ fontSize: "16px", fontWeight: "450" }}>
                          Reveal
                        </Typography>
                      }
                    />
                    <FormControlLabel
                      sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: "-15px", ml: "10px" }}
                      control={<Checkbox checked={checkedAllWordsSaved} onChange={handleCheckAllWordsSaved} />}
                      label={
                        <Typography color="textSecondary" sx={{ fontSize: "16px", fontWeight: "450" }}>
                          All words saved
                        </Typography>
                      }
                    />
                  </FormGroup>
                </Stack>
              </Box>
            </CardContent>
          </form>
        )}
        {step === "confirm" && (
          <form className="create-form">
            <input hidden type="text" autoComplete="username" value={undefined}></input>
            <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Tooltip title="Go back">
                <IconButton sx={{ position: "absolute", ml: "-325px" }} onClick={() => setStep("save")}>
                  <ReplyIcon />
                </IconButton>
              </Tooltip>
              <Box sx={{ border: 2, width: "280px", borderRadius: "12px", py: "6px", px: "10px" }}>
                <Typography align="center" color="textSecondary" sx={{ fontSize: "16px", fontWeight: "450" }}>
                  Confirm Your Recovery Phrase
                </Typography>
              </Box>
              <Tooltip title="Paste from clipboard">
                <IconButton sx={{ mt: "6px", mb: "6px" }} onClick={handlePasteFromClipboard}>
                  <ContentPasteIcon />
                </IconButton>
              </Tooltip>
              <Box sx={{ borderRadius: "12px" }}>
                <Grid container sx={{ alignItems: "center", justifyContent: "center", width: "300px" }}>
                  {userConfirmedMnemonic.map((word) => (
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
        )}
        {step === "create" && (
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
                  height: "190px",
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
        {step === "generate" && (
          <Button
            variant="contained"
            disabled={checkedLicenseRules ? false : true}
            sx={{
              background: checkedLicenseRules ? "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);" : "",
              width: "210px",
            }}
            onClick={() => {
              handleGenerate();
              setStep("save");
            }}
          >
            Generate Mnemonic
          </Button>
        )}

        {step === "save" && (
          <Button
            variant="contained"
            disabled={checkedAllWordsSaved ? false : true}
            sx={{
              background: checkedAllWordsSaved ? "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);" : "",
              width: "191px",
            }}
            onClick={() => {
              setStep("confirm");
            }}
          >
            Next
          </Button>
        )}

        {step === "confirm" && (
          <Button
            variant="contained"
            disabled={mnemonicValidated ? false : true}
            sx={{
              background: mnemonicValidated ? "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);" : "",
              width: "225px",
            }}
            onClick={() => {
              setStep("create");
            }}
          >
            Confirm Recovery Phrase
          </Button>
        )}
        {step === "create" && (
          <Button
            variant="contained"
            disabled={passwordValidated ? false : true}
            sx={{
              background: passwordValidated ? "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);" : "",
              width: "191px",
            }}
            onClick={handleCreate}
          >
            Create account
          </Button>
        )}
      </Stack>
    </Container>
  );
};

export default Create;
