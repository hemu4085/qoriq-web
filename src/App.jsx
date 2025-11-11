// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing.jsx";
import SeeInAction from "./pages/SeeInAction.jsx";
import AskYourData from "./pages/ask-your-data.jsx";   // ✅ use lowercase hyphen file
import Demo from "./pages/demo.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/see-in-action" element={<SeeInAction />} />
      <Route path="/ask-your-data" element={<AskYourData />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}
