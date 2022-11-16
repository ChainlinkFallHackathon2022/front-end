import React from "react";
import ReactDOM from "react-dom/client";
import { Route, Routes, HashRouter, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import Trade from "./views/Trade";
import Marketplace from "./views/Marketplace";
import reportWebVitals from "./reportWebVitals";
import { theme } from "./hooks/theme";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ThemeProvider theme={theme}>
    <HashRouter>
      <Routes>
        <Route path="/bot" element={<Trade />} />
        <Route path="/nft" element={<Marketplace />} />
        <Route path="*" element={<Navigate replace to="/bot" />} />
      </Routes>
    </HashRouter>
  </ThemeProvider>
);

reportWebVitals();
