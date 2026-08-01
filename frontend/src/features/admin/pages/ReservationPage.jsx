import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
const ReservationPage = () => {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch("/api/reservations");
        if (!response.ok) {
          throw new Error("예약 조회 실패");
        }
        const data = await response.json();
        setReservations(data);
      } catch (error) {
        setError(error.message);
      }
    };
    fetchReservations();
  }, []);

  const handleCancel = async (reservationId) => {
    const confirmed = window.confirm("예약을 취소하시겠습니까?");
    if (!confirmed) {
      return;
    }
    try {
      const response = await fetch(
        `/api/reservations/${reservationId}/cancel`,
        {
          method: "POST",
        },
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "예약 취소 실패.");
      }

      setReservations((prev) =>
        prev.filter((reservation) => reservation.id !== reservationId),
      );
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h1>예약 목록</h1>
      <Link to="/reservations/new">예약하기</Link>
      {error && <p>{error}</p>}

      {reservations.map((reservation) => (
        <div key={reservation.id}>
          <p>예약 ID : {reservation.id}</p>
          <p>회원번호 : {reservation.memberId}</p>
          <p>회원이름 : {reservation.memberName}</p>
          <p>자산번호 : {reservation.assetItemId}</p>
          <p>자산이름 : {reservation.assetName}</p>
          <p>상태 : {reservation.reservationStatus}</p>
          <p>예약일 : {reservation.reservedAt}</p>
          {["WAITING", "READY"].includes(reservation.reservationStatus) && (
            <button onClick={() => handleCancel(reservation.id)}>
              예약 취소
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReservationPage;
