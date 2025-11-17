import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import AppLayout from "./layout/AppLayout";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/app/*" element={<AppLayout />} />
    </Routes>
  );
}
