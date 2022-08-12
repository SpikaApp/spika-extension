import React, { useContext } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Navbar, Onboarding, Wallet, Create, Import, NFTs, Transactions, About } from "./pages";
import { ThemeProvider } from "@mui/material";
import { UIContext } from "./context/UIContext";
import { AccountProvider } from "./context/AccountContext";
import { Web3Provider } from "./context/Web3Context";
import { CssBaseline } from "@mui/material";
import { Box } from "@mui/material";
import { lightTheme, darkTheme } from "./theme";
import AlertDialog from "./components/AlertDialog";
import LoginDialog from "./components/LoginDialog";
import Loading from "./components/Loading";
import PermissionDialog from "./components/PermissionDialog";
import "./index.css";

const App = () => {
  const { spikaWallet, darkMode, accountRoutesEnabled, disableAllRoutes } = useContext(UIContext);

  return (
    <Router>
      <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
        <AccountProvider>
          <Web3Provider>
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
                            <Route path="/" exact element={<Wallet />} />
                          ) : (
                            <Route path="/" exact element={<Onboarding />} />
                          )}
                          {spikaWallet ? (
                            <Route path="*" exact element={<Wallet />} />
                          ) : (
                            <Route path="*" exact element={<Onboarding />} />
                          )}
                          {accountRoutesEnabled === true && (
                            <Route path="create" element={<Create />} />
                          )}
                          {accountRoutesEnabled === true && (
                            <Route path="import" element={<Import />} />
                          )}
                          <Route path="nfts" element={<NFTs />} />
                          <Route path="transactions" element={<Transactions />} />
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
          </Web3Provider>
        </AccountProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
