import React, { useContext } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Navbar, Wallet, Create, Import, NFTs, Transactions, About } from "./pages";
import { ThemeProvider } from "@mui/material";
import { UIContext } from "./context/UIContext";
import { AccountProvider } from "./context/AccountContext";
import { Web3Provider } from "./context/Web3Context";
import { SessionProvider } from "./context/SessionContext";
import { CssBaseline } from "@mui/material";
import { Box } from "@mui/material";
import { lightTheme, darkTheme } from "./theme";
import AlertDialog from "./components/AlertDialog";
import LoginDialog from "./components/LoginDialog";
import "./index.css";

const App = () => {
  const { darkMode, accountRoutesEnabled } = useContext(UIContext);

  return (
    <Router>
      <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
        <AccountProvider>
          <Web3Provider>
            <SessionProvider>
              <div className="App">
                <CssBaseline />
                <Box>
                  <Navbar />
                  <div className="content">
                    <Routes>
                      <Route path="/" exact element={<Wallet />} />
                      <Route path="*" element={<Wallet />} />
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
                  </div>
                </Box>
              </div>
              <LoginDialog />
              <AlertDialog />
            </SessionProvider>
          </Web3Provider>
        </AccountProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
