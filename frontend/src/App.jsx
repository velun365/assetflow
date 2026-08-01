import "./App.css";
import { Routes, Route } from "react-router-dom";
import MemberPage from "./features/admin/pages/MemberPage";
import CategoryPage from "./features/admin/pages/CategoryPage";
import LoanPage from "./features/admin/pages/LoanPage";
import AssetPage from "./features/admin/pages/AssetPage";
import AssetItemPage from "./features/admin/pages/AssetItemPage";
import ReservationPage from "./features/admin/pages/ReservationPage";
import AssetCreatePage from "./features/admin/pages/AssetCreatePage";
import AssetItemCreatePage from "./features/admin/pages/AssetItemCreatePage";

import MemberCreatePage from "./features/member/pages/MemberCreatePage";
import LoansPage from "./features/loan/pages/LoansPage";
import LoanCreatePage from "./features/loan/pages/LoanCreatePage";
import ReservationCreatePage from "./features/reservation/pages/ReservationCreatePage";

import HomePage from "./features/home/pages/HomePage";
import Notfound from "./features/Notfound";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/members" element={<MemberPage />} />
        <Route path="/admin/loans" element={<LoanPage />} />
        <Route path="/admin/reservations" element={<ReservationPage />} />
        <Route path="/admin/assets" element={<AssetPage />} />
        <Route path="/admin/asset-items" element={<AssetItemPage />} />
        <Route path="/admin/categories" element={<CategoryPage />} />
        <Route path="/admin/assets/new" element={<AssetCreatePage />} />
        <Route
          path="/admin/asset-items/new"
          element={<AssetItemCreatePage />}
        />
        <Route path="/members/new" element={<MemberCreatePage />} />
        <Route path="/loans/new" element={<LoanCreatePage />} />
        <Route path="/loansPage" element={<LoansPage />} />
        <Route path="/reservations/new" element={<ReservationCreatePage />} />

        <Route path="*" element={<Notfound />} />
      </Routes>
    </>
  );
}

export default App;
