import "bootstrap/dist/css/bootstrap.min.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import QueryProvider from "./shared/provider/QueryProvider.jsx";
import "./shared/styles/global.css";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <QueryProvider>
            <App />
        </QueryProvider>
    </StrictMode>,
);