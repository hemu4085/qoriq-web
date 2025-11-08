import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import SeeInAction from "./pages/SeeInAction.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/product/see-in-action" element={<SeeInAction />} />
    </Routes>
  );
}
