import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Navbar, Wallet, Create, Import, NFTs, Transactions, About, NotFound } from ".";
import { ThemeProvider } from "@mui/material";
import { UIProvider } from "./context/UIContext";
import { AccountProvider } from "./context/AccountContext";
import { CssBaseline } from "@mui/material";
import { Box } from "@mui/material";
import { theme } from "./theme";
import "./index.css";

const App = () => {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <UIProvider>
          <AccountProvider>
            <div className="App">
              <CssBaseline />
              <Box>
                <Navbar />
                <div className="content">
                  <Routes>
                    <Route path="/" exact element={<Wallet />} />
                    <Route path="404" element={<NotFound />} />
                    <Route path="create" element={<Create />} />
                    <Route path="import" element={<Import />} />
                    <Route path="nfts" element={<NFTs />} />
                    <Route path="transactions" element={<Transactions />} />
                    <Route path="about" element={<About />} />
                  </Routes>
                </div>
              </Box>
            </div>
          </AccountProvider>
        </UIProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
