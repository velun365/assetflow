import { useEffect, useState } from "react";

const ReservationAdminPage = () => {
  const [reservations, setReservations] = useState([]);

  const [pageInfo, setPageInfo] = useState({
    number: 0,
    totalPages: 0,
    first: true,
    last: true,
  });

  const [searchType, setSearchType] = useState("memberName");
  const [keyword, setKeyword] = useState("");
  const [reservationStatus, setReservationStatus] = useState("");
  const [error, setError] = useState("");

  const loadReservations = async (pageNumber = 0) => {
    try {
      setError("");

      const params = new URLSearchParams();

      if (keyword.trim() !== "") {
        params.append(searchType, keyword.trim());
      }

      if (reservationStatus !== "") {
        params.append("reservationStatus", reservationStatus);
      }

      params.append("page", pageNumber);
      params.append("size", 10);

      const response = await fetch(
        `/api/reservations/search?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error("예약 조회에 실패했습니다.");
      }

      const data = await response.json();

      setReservations(data.content);

      setPageInfo({
        number: data.number,
        totalPages: data.totalPages,
        first: data.first,
        last: data.last,
      });
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    loadReservations(0);
  }, []);

  const handleSearch = () => {
    loadReservations(0);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      loadReservations(0);
    }
  };

  return (
    <div>
      <h1>예약 현황</h1>

      <div>
        <select
          value={searchType}
          onChange={(event) => setSearchType(event.target.value)}
        >
          <option value="memberName">회원명</option>
          <option value="assetName">자산명</option>
        </select>

        <input
          type="text"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="검색어"
        />

        <select
          value={reservationStatus}
          onChange={(event) => setReservationStatus(event.target.value)}
        >
          <option value="">전체 상태</option>
          <option value="WAITING">대기 중</option>
          <option value="READY">대여 준비</option>
          <option value="COMPLETED">대여 완료</option>
          <option value="CANCELED">취소</option>
        </select>

        <button type="button" onClick={handleSearch}>
          검색
        </button>
      </div>

      {error && <p>{error}</p>}

      {reservations.length === 0 && !error ? (
        <p>예약 내역이 없습니다.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>예약번호</th>
              <th>회원명</th>
              <th>자산명</th>
              <th>예약일</th>
              <th>상태</th>
            </tr>
          </thead>

          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation.reservationId}>
                <td>{reservation.reservationId}</td>
                <td>{reservation.memberName}</td>
                <td>{reservation.assetName}</td>
                <td>{reservation.reservedAt}</td>
                <td>{reservation.reservationStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {pageInfo.totalPages > 0 && (
        <div>
          <button
            type="button"
            disabled={pageInfo.first}
            onClick={() => loadReservations(pageInfo.number - 1)}
          >
            이전
          </button>

          {Array.from({ length: pageInfo.totalPages }).map((_, index) => (
            <button
              type="button"
              key={index}
              disabled={pageInfo.number === index}
              onClick={() => loadReservations(index)}
            >
              {index + 1}
            </button>
          ))}

          <button
            type="button"
            disabled={pageInfo.last}
            onClick={() => loadReservations(pageInfo.number + 1)}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
};

export default ReservationAdminPage;
