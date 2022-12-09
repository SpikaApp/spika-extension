import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { useContext } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AlertDialog from "./components/AlertDialog";
import Loading from "./components/Loading";
import LoginDialog from "./components/LoginDialog";
import Navbar from "./components/Navbar";
import PermissionDialog from "./components/PermissionDialog";
import { AccountProvider } from "./context/AccountContext";
import { PayloadProvider } from "./context/PayloadContext";
import { UIContext } from "./context/UIContext";
import { Web3Provider } from "./context/Web3Context";
import { DexProvider } from "./context/DexContext";
import "./index.css";
import { About, Create, Import, NFTs, Onboarding, Settings, Swap, Tests, Transactions, Wallet } from "./pages";
import { darkTheme, lightTheme } from "./theme";

const App = (): JSX.Element => {
  const { spikaWallet, darkMode, accountRoutesEnabled, disableAllRoutes, devMode } = useContext(UIContext);

  return (
    <Router>
      <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
        <AccountProvider>
          <PayloadProvider>
            <Web3Provider>
              <DexProvider>
                <div className="App">
                  <CssBaseline />
                  <Box>
                    {spikaWallet === undefined ? (
                      <div></div>
                    ) : (
                      <div>
                        {!disableAllRoutes && <Navbar />}
                        <div className="content">
                          {!disableAllRoutes && (
                            <Routes>
                              {spikaWallet ? (
                                <Route path="/" element={<Wallet />} />
                              ) : (
                                <Route path="/" element={<Onboarding />} />
                              )}
                              {spikaWallet ? (
                                <Route path="*" element={<Wallet />} />
                              ) : (
                                <Route path="*" element={<Onboarding />} />
                              )}
                              {accountRoutesEnabled === true && <Route path="create" element={<Create />} />}
                              {accountRoutesEnabled === true && <Route path="import" element={<Import />} />}
                              <Route path="swap" element={<Swap />} />
                              {devMode && <Route path="tests" element={<Tests />} />}
                              <Route path="nfts" element={<NFTs />} />
                              <Route path="transactions" element={<Transactions />} />
                              <Route path="settings" element={<Settings />} />
                              <Route path="about" element={<About />} />
                            </Routes>
                          )}
                        </div>
                      </div>
                    )}
                  </Box>
                </div>
                <LoginDialog />
                <AlertDialog />
                <Loading />
                <PermissionDialog />
              </DexProvider>
            </Web3Provider>
          </PayloadProvider>
        </AccountProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
