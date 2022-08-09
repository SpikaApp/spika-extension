import React from "react";
import ReactDOM from "react-dom/client";
import { UIProvider } from "./context/UIContext";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UIProvider>
      <App />
    </UIProvider>
  </React.StrictMode>
);
