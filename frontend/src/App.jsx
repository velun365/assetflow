import "./App.css";
import { Routes, Route } from "react-router-dom";
import MemberPage from "./pages/MemberPage";
import MemberCreatePage from "./pages/MemberCreatePage";
import AssetPage from "./pages/AssetPage";
import AssetCreatePage from "./pages/AssetCreatePage";
import AssetItemPage from "./pages/AssetItemPage";
import AssetItemCreatePage from "./pages/AssetItemCreatePage";
import CategoryPage from "./pages/CategoryPage";
import HomePage from "./pages/HomePage";
import LoanPage from "./pages/LoanPage";
import ReservationPage from "./pages/ReservationPage";
import ReservationCreatePage from "./pages/ReservationCreatePage";
import Notfound from "./pages/Notfound";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/members/search" element={<MemberPage />} />
        <Route path="/members/new" element={<MemberCreatePage />} />
        <Route path="/assets" element={<AssetPage />} />
        <Route path="/assets/new" element={<AssetCreatePage />} />
        <Route path="/asset-items" element={<AssetItemPage />} />
        <Route path="/asset-items/new" element={<AssetItemCreatePage />} />
        <Route path="/categories" element={<CategoryPage />} />

        <Route path="/loans" element={<LoanPage />} />
        <Route path="/reservations" element={<ReservationPage />} />
        <Route path="/reservations/new" element={<ReservationCreatePage />} />
        <Route path="*" element={<Notfound />} />
      </Routes>
    </>
  );
}

export default App;
