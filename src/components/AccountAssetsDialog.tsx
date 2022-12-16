import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
} from "@mui/material";
import InputBase from "@mui/material/InputBase";
import { alpha, styled } from "@mui/material/styles";
import { useContext, useEffect, useState } from "react";
import { AccountContext } from "../context/AccountContext";
import { DexContext } from "../context/DexContext";
import { UIContext } from "../context/UIContext";
import { Web3Context } from "../context/Web3Context";
import { ICoin } from "../interface";
import { getAssetStore } from "../lib/assetStore";
import { setStore } from "../lib/store";
import { fetchCoinlist } from "../utils/coinlist";
import { PLATFORM } from "../utils/constants";
import debug from "../utils/debug";
import { stringToValue } from "../utils/values";

type AccountAssetsDialogProps = {
  type?: "xCoin" | "yCoin";
};

type ICoinListType = "account" | "all";

const AccountAssetsDialog = (props: AccountAssetsDialogProps): JSX.Element => {
  const { openAccountAssetsDialog, setOpenAccountAssetsDialog, darkMode } = useContext(UIContext);
  const { setIsLoading, currentAddress, setCurrentAsset, accountAssets, currentNetwork, validateAccount } =
    useContext(AccountContext);
  const { updateAccountAssets, updateBalance } = useContext(Web3Context);
  const { setIsFetching, setXCoin, setYCoin } = useContext(DexContext);
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [selectedList, setSelectedList] = useState<ICoin[]>([]);
  const [coinlist, setCoinlist] = useState<ICoin[]>([]);
  const [searchString, setSearchString] = useState<string>("");
  const [listType, setListType] = useState<ICoinListType | undefined>(undefined);
  const [hasList, setHasList] = useState<boolean>(false);

  const _currentAsset = "currentAsset";

  useEffect(() => {
    if (openAccountAssetsDialog) {
      if (props && props.type === "yCoin") {
        setListType("all");
        debug.log("Setting coin list type to 'all'");
      } else {
        if (listType === "all") {
          setSelectedList(accountAssets);
          setCoinlist(accountAssets);
        }
        setListType("account");
        debug.log("Setting coin list type to 'account'");
      }
    }
  }, [openAccountAssetsDialog]);

  useEffect(() => {
    if (openAccountAssetsDialog) {
      let result: ICoin[] = [];
      switch (listType) {
        case "account":
          getAccountAssets();
          break;
        case "all":
          result = getCoinlist();
          setSelectedList(result);
          break;
      }
      debug.log(`Selected coinlist set to: ${listType === "account" ? "account" : "dex coins"}`);
    }
  }, [listType]);

  useEffect(() => {
    if (!isLocalLoading) {
      setCoinlist(search(selectedList, searchString));
      debug.log("Coinlist updated:", selectedList);
    }
  }, [!isLocalLoading]);

  useEffect(() => {
    if (coinlist.length !== 0) {
      setHasList(true);
    } else {
      setHasList(false);
    }
  }, [coinlist]);

  useEffect(() => {
    if (selectedList.length > 0) {
      let result: ICoin[];
      if (searchString === "") {
        result = selectedList;
      } else {
        result = search(selectedList, searchString);
      }
      debug.log(`Search string '${searchString}' matches the following coinlist:`, result);
      setCoinlist(result);
    }
  }, [searchString]);

  const search = (list: ICoin[], searchStr: string): ICoin[] => {
    const result: ICoin[] = [];
    list.filter((asset) => {
      const matchByName = asset.data.name.toLowerCase().includes(searchStr.toLowerCase());
      const matchBySymbol = asset.data.symbol.toLowerCase().includes(searchStr.toLowerCase());
      if (matchByName || matchBySymbol) {
        result.push(asset);
      }
    });
    return result;
  };

  const getAccountAssets = async (): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const validated = await validateAccount(currentAddress!);
    console.log("Validated: ", validated);
    if (!validated) {
      setCoinlist([]);
      setSelectedList([]);
      setIsLocalLoading(false);
      return;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const cached = await getAssetStore(currentAddress!);
      console.log(cached);
      if (cached) {
        setCoinlist(cached.assets);
        setSelectedList(cached.assets);
      }
      setIsLocalLoading(true);
      const data = await updateAccountAssets();
      if (data) {
        setSelectedList(data);
      } else {
        if (!cached) {
          setSelectedList([]);
        }
      }
      setIsLocalLoading(false);
    }
  };

  const getCoinlist = (): ICoin[] => {
    setIsFetching(false);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = fetchCoinlist(currentNetwork!.data.node_url);
    result.sort((a: ICoin, b: ICoin) => a.data.name.localeCompare(b.data.name));
    setIsLocalLoading(false);
    return result;
  };

  const handleSwitchAsset = async (asset: ICoin): Promise<void> => {
    if (props && props.type === "xCoin") {
      setXCoin(asset);
    } else if (props && props.type === "yCoin") {
      setYCoin(asset);
    } else {
      setStore(PLATFORM, _currentAsset, asset);
      setCurrentAsset(asset);
    }
    await handleUpdateBalance(asset);
    setOpenAccountAssetsDialog(false);
    handleCancel();
  };

  const handleUpdateBalance = async (asset: ICoin): Promise<void> => {
    setIsLoading(true);
    await updateBalance(asset);
    setIsLoading(false);
  };

  const handleCancel = (): void => {
    setOpenAccountAssetsDialog(false);
    setIsLocalLoading(true);
    setListType(undefined);
    setSelectedList([]);
    setCoinlist([]);
    setSearchString("");
  };

  const Search = styled("div")(({ theme }) => ({
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(1),
      width: "auto",
    },
  }));

  const SearchIconWrapper = styled("div")(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }));

  const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: "inherit",
    "& .MuiInputBase-input": {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)})`,
      transition: theme.transitions.create("width"),
      width: "100%",
      [theme.breakpoints.up("sm")]: {
        width: "12ch",
        "&:focus": {
          width: "20ch",
        },
      },
    },
  }));

  return (
    <Dialog open={openAccountAssetsDialog}>
      <DialogTitle align="center" sx={{ mb: "-12px" }}>
        Select Asset
        {isLocalLoading && coinlist.length !== 0 && (
          <Tooltip title={"Fetching"}>
            <CircularProgress
              sx={{
                display: "flex",
                ml: "215px",
                color: "#9e9e9e",
                position: "absolute",
                mt: "-25px",
              }}
              size={20}
              thickness={5.5}
            />
          </Tooltip>
        )}
      </DialogTitle>
      <DialogContent sx={{ minHeight: "330px" }}>
        <Box sx={{ alignItems: "center", mb: "15px", ml: "-5px", mr: "1px" }}>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ "aria-label": "search" }}
              autoFocus={true}
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
            />
          </Search>
        </Box>
        <Paper sx={{ width: "260px", minHeight: "65px", bgcolor: "background.paper" }}>
          <List component="nav" sx={{ overflow: "hidden", overflowY: "visible", maxHeight: "255px" }}>
            {isLocalLoading && coinlist.length === 0 && (
              <CircularProgress sx={{ display: "flex", ml: "110px", mt: "10px", color: "#9e9e9e" }} size={32} />
            )}
            {hasList &&
              coinlist.map((asset) => (
                <Stack key={asset.type}>
                  <ListItemButton
                    onClick={() => {
                      handleSwitchAsset(asset);
                    }}
                  >
                    <ListItemIcon>
                      <Box
                        component="img"
                        src={darkMode ? asset.data.logo_alt : asset.data.logo}
                        sx={{ width: 32, height: 32 }}
                      ></Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={`${asset.data.name}`}
                      secondary={
                        asset.data.balance &&
                        Number(asset.data.balance) > 0 &&
                        `${stringToValue(asset, asset.data.balance)} ${asset.data.symbol}`
                      }
                    />
                  </ListItemButton>
                </Stack>
              ))}
            {coinlist.length === 0 && !isLocalLoading && (
              <ListItemText
                primary="No assets found"
                primaryTypographyProps={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  mt: "10px",
                }}
              />
            )}
          </List>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccountAssetsDialog;
