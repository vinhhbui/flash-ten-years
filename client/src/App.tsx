import { Navigate, Route, Routes } from "react-router-dom";
import CountdownPage from "./countdown-page/CountdownPage";
import LandingPage from "./pages/LandingPage";
import WallPage from "./pages/WallPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/countdown-page" element={<CountdownPage />} />
      <Route path="/wall" element={<WallPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
