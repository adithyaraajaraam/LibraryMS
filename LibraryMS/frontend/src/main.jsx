import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Simple global reset
const style = document.createElement("style");
style.textContent = `
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Segoe UI', sans-serif; }
  a { text-decoration: none; }
  button:hover { opacity: 0.9; }
  input:focus { border-color: #1e3a5f !important; }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
