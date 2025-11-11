// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing.jsx";
import SeeInAction from "./pages/SeeInAction.jsx";
import AskYourData from "./pages/AskYourData.jsx";

export default function App() {
  return (
    <Routes>
      {/* Home / Landing */}
      <Route path="/" element={<Landing />} />

      {/* Product Pages */}
      <Route path="/product/see-in-action" element={<SeeInAction />} />
      <Route path="/product/ask-your-data" element={<AskYourData />} />

      {/* Catch-all → back to landing */}
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}

