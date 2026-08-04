import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div>
      <h2>관리자</h2>

      {/* Member */}
      <Link to="/admin/members">회원 검색</Link>
      <br />

      {/* Category */}
      <Link to="/admin/categories">카테고리 관리</Link>
      <br />

      {/* Asset */}
      <Link to="/admin/assets">자산 종류 목록</Link>
      <br />

      <Link to="/admin/assets/new">자산 등록</Link>
      <br />

      {/* AssetItem */}
      <Link to="/admin/asset-items">개별 자산품목 목록</Link>
      <br />

      <Link to="/admin/asset-items/new">개별 자산품목 등록</Link>
      <br />

      {/* Loan */}
      <Link to="/admin/loans">대여 전체 조회 · 반납 승인</Link>
      <br />

      {/* Reservation */}
      <Link to="/admin/reservations">예약 목록</Link>
      <br />

      <h2>회원</h2>

      {/* Member */}
      <Link to="/members/new">회원가입</Link>
      <br />

      {/* Loan */}
      <Link to="/loans/new">대여하기</Link>
      <br />

      <Link to="/loans">내 대여 목록 · 반납 요청</Link>
      <br />

      {/* Reservation */}
      <Link to="/reservations/new">예약하기</Link>
      <br />
    </div>
  );
};

export default HomePage;
