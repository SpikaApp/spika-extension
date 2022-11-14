import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { UIProvider } from "./context/UIContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <UIProvider>
      <App />
    </UIProvider>
  </React.StrictMode>
);
