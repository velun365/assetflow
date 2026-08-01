import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div>
      <h2>관리자</h2>

      <Link to="/admin/members">회원 검색</Link>
      <br />

      <Link to="/admin/categories">카테고리 관리</Link>
      <br />

      <Link to="/admin/loans">대여 전체 조회 · 반납 승인</Link>
      <br />

      <Link to="/admin/reservations">예약 목록</Link>
      <br />

      <Link to="/admin/assets">자산 종류 목록</Link>
      <br />

      <Link to="/admin/assets/new">자산 종류 등록</Link>
      <br />

      <Link to="/admin/asset-items">개별 자산품목 목록</Link>
      <br />

      <Link to="/admin/asset-items/new">개별 자산품목 등록</Link>
      <br />

      <h2>회원</h2>

      <Link to="/members/new">회원가입</Link>
      <br />

      <Link to="/loans/new">대여하기</Link>
      <br />
      <Link to="/loansPage">회원용 대여 페이지</Link>
      <br />
      <Link to="/reservations/new">예약하기</Link>
      <br />
    </div>
  );
};

export default HomePage;
