import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout.jsx";
import Landing from "./pages/Landing.jsx";
import TestStrategy from "./pages/TestStrategy.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Results from "./pages/Results.jsx";
import "./styles/App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<AppLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="test" element={<TestStrategy />} />
          <Route path="results" element={<Results />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
