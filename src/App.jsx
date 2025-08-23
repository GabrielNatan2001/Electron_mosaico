import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import PagesRoutes from "./routes/PagesRoutes";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import i18n from "./i18n";
import { I18nextProvider } from "react-i18next";
import React from "react";
import { HashRouter } from "react-router-dom";

const applyInitialTheme = () => {
  const savedTheme = sessionStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const initialTheme = savedTheme ? savedTheme === "dark" : prefersDark;

  if (initialTheme) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

applyInitialTheme();

function App() {
  return (
   <StrictMode>
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <HashRouter>
          <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            <div style={{ flex: 1, minHeight: 0 }}>
              <PagesRoutes />
            </div>
          </div>
          <ToastContainer position="top-right" autoClose={3000} />
        </HashRouter>
      </AuthProvider>
    </I18nextProvider>
  </StrictMode>
  );
}

export default App;
