import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../auth/context/AuthContext";
import LoginPage from "../../auth/pages/LoginPage";

const HomePage = () => {
  const { user, loading } = useContext(AuthContext);
  const adminMenus = [
    ["회원 관리", "회원과 부서 정보를 검색합니다.", "/admin/members"],
    ["카테고리 관리", "자산 분류를 등록하고 관리합니다.", "/admin/categories"],
    ["자산 관리", "자산 종류와 보유 현황을 확인합니다.", "/admin/assets"],
    [
      "자산 품목",
      "개별 자산의 위치와 상태를 관리합니다.",
      "/admin/asset-items",
    ],
    ["대여 관리", "대여 현황과 반납 요청을 처리합니다.", "/admin/loans"],
    ["예약 관리", "예약 순서와 처리 상태를 조회합니다.", "/admin/reservations"],
  ];

  const userMenus = [
    ["대여 신청", "대여 가능한 자산을 선택합니다.", "/loans/new"],
    ["내 대여 목록", "대여 상태 확인과 반납 요청을 진행합니다.", "/loans"],
    ["예약 신청", "현재 대여 중인 자산을 예약합니다.", "/reservations/new"],
    [
      "내 예약 목록",
      "예약 상태를 확인하고 취소할 수 있습니다.",
      "/reservations",
    ],
  ];
  if (loading) {
    return null;
  }
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>업무 메뉴</h1>
          <p>
            자산 등록부터 대여, 예약, 반납까지 필요한 업무 화면으로 이동합니다.
          </p>
        </div>
      </div>

      {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
        <section className="home-section">
          <div className="home-section__title">
            <h2>관리자 메뉴</h2>
            <span>자산 및 사용자 운영</span>
          </div>
          <div className="home-grid">
            {adminMenus.map(([title, description, to]) => (
              <Link key={to} to={to} className="home-card">
                <h3>{title}</h3>
                <p>{description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {user && (
        <section className="home-section">
          <div className="home-section__title">
            <h2>사용자 메뉴</h2>
            <span>신청 및 내역 확인</span>
          </div>
          <div className="home-grid">
            {userMenus.map(([title, description, to]) => (
              <Link key={to} to={to} className="home-card">
                <h3>{title}</h3>
                <p>{description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
