import { useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../features/auth/context/AuthContext";
import { getCsrfToken } from "../api/csrfFetch";
const PAGE_TITLES = {
  "/": "대시보드",
  "/admin/members": "회원 관리",
  "/signup": "회원가입",
  "/admin/assets": "자산 관리",
  "/admin/assets/new": "자산 등록",
  "/admin/asset-items": "자산 품목 관리",
  "/admin/asset-items/new": "자산 품목 등록",
  "/admin/categories": "카테고리 관리",
  "/admin/loans": "대여 관리",
  "/loans/new": "대여 신청",
  "/loans": "내 대여 목록",
  "/admin/reservations": "예약 관리",
  "/reservations/new": "예약 신청",
  "/reservations": "내 예약 목록",
  "/login": "로그인",
};

const Header = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const title = pathname.startsWith("/admin/assets/")
    ? "자산 상세"
    : PAGE_TITLES[pathname] || "대시보드";
  const { user, setUser, loading } = useContext(AuthContext);

  const handleLogout = async () => {
    const confirmed = window.confirm("로그아웃을 하시겠습니까?");
    if (!confirmed) {
      return;
    }
    const csrfToken = await getCsrfToken();
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "X-XSRF-TOKEN": csrfToken,
      },
    });
    if (response.ok) {
      setUser(null);
      navigate("/login");
    }
  };

  return (
    <header className="app-header">
      <h1 className="app-header__title">{title}</h1>
      {!loading && user && <button onClick={handleLogout}>로그아웃</button>}
    </header>
  );
};

export default Header;
