import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CallProvider } from "./context/CallContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <BrowserRouter>
        <AuthProvider>
            <CallProvider>
                <App />
            </CallProvider>
        </AuthProvider>
    </BrowserRouter>
);