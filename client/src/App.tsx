import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CreatePage from "./pages/CreatePage";
import WallPage from "./pages/WallPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/create" element={<CreatePage />} />
      <Route path="/wall" element={<WallPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
