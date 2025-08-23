import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Monta o React dentro da div#root do index.html
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);