import React, { useContext } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Navbar, Wallet, Create, Import, NFTs, Transactions, About } from "./pages";
import { ThemeProvider } from "@mui/material";
import { UIContext } from "./context/UIContext";
import { AccountProvider } from "./context/AccountContext";
import { CssBaseline } from "@mui/material";
import { Box } from "@mui/material";
import { lightTheme, darkTheme } from "./theme";
import AlertDialog from "./components/AlertDialog";
import LoginDialog from "./components/LoginDialog";
import "./index.css";

const App = () => {
  const { darkMode } = useContext(UIContext);
  return (
    <Router>
      <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
        <AccountProvider>
          <div className="App">
            <CssBaseline />
            <Box>
              <Navbar />
              <div className="content">
                <Routes>
                  <Route path="/" exact element={<Wallet />} />
                  <Route path="*" element={<Wallet />} />
                  <Route path="create" element={<Create />} />
                  <Route path="import" element={<Import />} />
                  <Route path="nfts" element={<NFTs />} />
                  <Route path="transactions" element={<Transactions />} />
                  <Route path="about" element={<About />} />
                </Routes>
              </div>
            </Box>
          </div>
          <LoginDialog />
          <AlertDialog />
        </AccountProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
