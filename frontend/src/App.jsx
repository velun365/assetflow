import "./App.css";
import { Routes, Route } from "react-router-dom";

import AssetAdminPage from "./features/asset/pages/AssetAdminPage";
import AssetDetailPage from "./features/asset/pages/AssetDetailPage";
import AssetItemAdminPage from "./features/asset/pages/AssetItemAdminPage";
import AssetCreatePage from "./features/asset/pages/AssetCreatePage";
import AssetItemCreatePage from "./features/asset/pages/AssetItemCreatePage";

import CategoryAdminPage from "./features/category/pages/CategoryAdminPage";

import LoanAdminPage from "./features/loan/pages/LoanAdminPage";
import LoanCreatePage from "./features/loan/pages/LoanCreatePage";
import LoansPage from "./features/loan/pages/LoansPage";

import MemberAdminPage from "./features/member/pages/MemberAdminPage";
import MemberCreatePage from "./features/member/pages/MemberCreatePage";

import ReservationAdminPage from "./features/reservation/pages/ReservationAdminPage";
import ReservationCreatePage from "./features/reservation/pages/ReservationCreatePage";

import HomePage from "./features/home/pages/HomePage";
import Notfound from "./features/Notfound";

function App() {
  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<HomePage />} />

      {/* Member */}
      <Route path="/admin/members" element={<MemberAdminPage />} />
      <Route path="/members/new" element={<MemberCreatePage />} />

      {/* Asset */}
      <Route path="/admin/assets" element={<AssetAdminPage />} />
      <Route path="/admin/assets/new" element={<AssetCreatePage />} />
      <Route path="/admin/assets/:assetId" element={<AssetDetailPage />} />

      <Route path="/admin/asset-items" element={<AssetItemAdminPage />} />
      <Route path="/admin/asset-items/new" element={<AssetItemCreatePage />} />

      <Route path="/admin/categories" element={<CategoryAdminPage />} />

      {/* Loan */}
      <Route path="/admin/loans" element={<LoanAdminPage />} />
      <Route path="/loans/new" element={<LoanCreatePage />} />
      <Route path="/loans" element={<LoansPage />} />

      {/* Reservation */}
      <Route path="/admin/reservations" element={<ReservationAdminPage />} />
      <Route path="/reservations/new" element={<ReservationCreatePage />} />

      {/* Not Found */}
      <Route path="*" element={<Notfound />} />
    </Routes>
  );
}

export default App;
