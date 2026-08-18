import "./App.css";
import { Routes, Route } from "react-router-dom";

import LoginPage from "./features/auth/pages/LoginPage";

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
import MyPage from "./features/member/pages/MyPage";
import SignupPage from "./features/member/pages/SignupPage";

import ReservationAdminPage from "./features/reservation/pages/ReservationAdminPage";
import ReservationCreatePage from "./features/reservation/pages/ReservationCreatePage";
import ReservationsPage from "./features/reservation/pages/ReservationsPage";

import HomePage from "./features/home/pages/HomePage";
import Notfound from "./features/Notfound";
import AppLayout from "./shared/components/AppLayout";
import ProtectedRoute from "./shared/components/ProtectedRoute";

function App() {
  return (
    <AppLayout>
      <Routes>
        {/* 공개 */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Member */}
        <Route
          path="/admin/members"
          element={
            <ProtectedRoute roles={["ADMIN", "MANAGER"]}>
              <MemberAdminPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/me"
          element={
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          }
        />

        {/* Asset */}
        <Route
          path="/admin/assets"
          element={
            <ProtectedRoute roles={["ADMIN", "MANAGER"]}>
              <AssetAdminPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/assets/new"
          element={
            <ProtectedRoute roles={["ADMIN", "MANAGER"]}>
              <AssetCreatePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/assets/:assetId"
          element={
            <ProtectedRoute roles={["ADMIN", "MANAGER"]}>
              <AssetDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/asset-items"
          element={
            <ProtectedRoute roles={["ADMIN", "MANAGER"]}>
              <AssetItemAdminPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/asset-items/new"
          element={
            <ProtectedRoute roles={["ADMIN", "MANAGER"]}>
              <AssetItemCreatePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute roles={["ADMIN", "MANAGER"]}>
              <CategoryAdminPage />
            </ProtectedRoute>
          }
        />

        {/* Loan */}
        <Route
          path="/admin/loans"
          element={
            <ProtectedRoute roles={["ADMIN", "MANAGER"]}>
              <LoanAdminPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/loans/new"
          element={
            <ProtectedRoute>
              <LoanCreatePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/loans"
          element={
            <ProtectedRoute>
              <LoansPage />
            </ProtectedRoute>
          }
        />

        {/* Reservation */}
        <Route
          path="/admin/reservations"
          element={
            <ProtectedRoute roles={["ADMIN", "MANAGER"]}>
              <ReservationAdminPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reservations/new"
          element={
            <ProtectedRoute>
              <ReservationCreatePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reservations"
          element={
            <ProtectedRoute>
              <ReservationsPage />
            </ProtectedRoute>
          }
        />

        {/* Not Found */}
        <Route path="*" element={<Notfound />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
