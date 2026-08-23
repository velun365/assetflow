import { useEffect, useState } from "react";
import StatusBadge from "../../../shared/components/StatusBadge";
import { getCsrfToken } from "../../../shared/api/csrfFetch";
import { formatDateTime } from "../../../shared/utils/dateTime";

const ReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReservations = async () => {
      try {
        const response = await fetch("/api/reservations/my");

        if (!response.ok) {
          throw new Error("내 예약 목록 조회에 실패했습니다.");
        }

        const data = await response.json();
        setReservations(data);
      } catch (error) {
        setError(error.message);
      }
    };

    loadReservations();
  }, []);

  const cancelReservation = async (reservationId) => {
    const confirmed = window.confirm("예약을 취소하시겠습니까?");

    if (!confirmed) {
      return;
    }

    try {
      const csrfToken = await getCsrfToken();

      const response = await fetch(
        `/api/reservations/${reservationId}/cancel`,
        {
          method: "POST",
          headers: {
            "X-XSRF-TOKEN": csrfToken,
          },
        },
      );

      if (!response.ok) {
        throw new Error("예약 취소에 실패했습니다.");
      }

      setReservations((prevReservations) =>
        prevReservations.map((reservation) =>
          reservation.reservationId === reservationId
            ? {
                ...reservation,
                reservationStatus: "CANCELED",
              }
            : reservation,
        ),
      );
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>내 예약 목록</h1>
          <p>현재 예약 상태를 확인하고 예약을 취소합니다.</p>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="table-card">
        {reservations.length === 0 && !error ? (
          <p className="empty-state">예약 내역이 없습니다.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>자산명</th>
                  <th>시리얼번호</th>
                  <th>예약일</th>
                  <th>상태</th>
                  <th className="data-table__action">처리</th>
                </tr>
              </thead>

              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation.reservationId}>
                    <td className="data-table__primary">
                      {reservation.assetName}
                    </td>
                    <td>{reservation.serialNumber}</td>
                    <td>{formatDateTime(reservation.reservedAt)}</td>
                    <td>
                      <StatusBadge status={reservation.reservationStatus} />
                    </td>
                    <td className="data-table__action">
                      {["WAITING", "READY"].includes(
                        reservation.reservationStatus,
                      ) ? (
                        <div className="table-actions">
                          <button
                            type="button"
                            className="table-action"
                            onClick={() =>
                              cancelReservation(reservation.reservationId)
                            }
                          >
                            예약 취소
                          </button>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationsPage;
