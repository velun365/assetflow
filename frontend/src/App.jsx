import "./App.css";
import { Routes, Route } from "react-router-dom";
import MemberPage from "./pages/MemberPage";
import MemberCreatePage from "./pages/MemberCreatePage";
import AssetPage from "./pages/AssetPage";
import AssetItemPage from "./pages/AssetItemPage";
import HomePage from "./pages/HomePage";
import LoanPage from "./pages/LoanPage";
import ReservationPage from "./pages/ReservationPage";
import Notfound from "./pages/Notfound";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/members/search" element={<MemberPage />} />
        <Route path="/members/new" element={<MemberCreatePage />} />
        <Route path="/assets" element={<AssetPage />} />
        <Route path="/asset-items" element={<AssetItemPage />} />
        <Route path="/loans" element={<LoanPage />} />
        <Route path="/reservations" element={<ReservationPage />} />
        <Route path="*" element={<Notfound />} />
      </Routes>
    </>
  );
}

export default App;
