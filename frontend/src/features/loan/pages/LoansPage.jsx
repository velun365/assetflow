import { useEffect, useState } from "react";
import StatusBadge from "../../../shared/components/StatusBadge";
import { AuthContext } from "../../auth/context/AuthContext";
import { getCsrfToken } from "../../../shared/api/csrfFetch";
const LoansPage = () => {
  const [loans, setLoans] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadLoans = async () => {
      try {
        const response = await fetch("/api/loans/my");

        if (!response.ok) {
          throw new Error("내 대여 목록 조회에 실패했습니다.");
        }

        const data = await response.json();
        setLoans(data);
      } catch (error) {
        setError(error.message);
      }
    };

    loadLoans();
  }, []);

  const requestReturn = async (loanId) => {
    const confirmed = window.confirm("반납을 요청하시겠습니까?");

    if (!confirmed) {
      return;
    }

    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch(`/api/loans/${loanId}/return-request`, {
        method: "POST",
        headers: {
          "X-XSRF-TOKEN": csrfToken,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "반납 요청에 실패했습니다.");
      }

      setLoans((prevLoans) =>
        prevLoans.map((loan) =>
          loan.loanId === loanId
            ? {
                ...loan,
                loanStatus: data.loanStatus,
              }
            : loan,
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
          <h1>내 대여 목록</h1>
          <p>현재 대여 상태와 반납 예정일을 확인하고 반납을 요청합니다.</p>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="table-card">
        {loans.length === 0 && !error ? (
          <p className="empty-state">대여 내역이 없습니다.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>대여번호</th>
                  <th>자산명</th>
                  <th>시리얼번호</th>
                  <th>대여일</th>
                  <th>반납예정일</th>
                  <th>상태</th>
                  <th>처리</th>
                </tr>
              </thead>

              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.loanId}>
                    <td>{loan.loanId}</td>
                    <td className="data-table__primary">{loan.assetName}</td>
                    <td>{loan.serialNumber}</td>
                    <td>{loan.loanDate}</td>
                    <td>{loan.dueDate}</td>
                    <td>
                      <StatusBadge status={loan.loanStatus} />
                    </td>
                    <td>
                      {loan.loanStatus === "RENTED" ? (
                        <button
                          type="button"
                          onClick={() => requestReturn(loan.loanId)}
                        >
                          반납 요청
                        </button>
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

export default LoansPage;
