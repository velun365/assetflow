import { useEffect, useState } from "react";

const LoansPage = () => {
  console.log("LoansPage 렌더링됨");
  const memberId = 1;

  const [loans, setLoans] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("대여 목록 useEffect 실행");

    const loadLoans = async () => {
      try {
        const response = await fetch(`/api/loans/members/${memberId}`);

        if (!response.ok) {
          throw new Error("내 대여 목록 조회에 실패했습니다.");
        }

        const data = await response.json();
        console.log("회원별 대여 응답:", data);
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
      const response = await fetch(
        `/api/loans/${loanId}/return-request?memberId=${memberId}`,
        {
          method: "POST",
        },
      );

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
    <div>
      <h1>내 대여 목록</h1>

      {error && <p>{error}</p>}

      {loans.length === 0 && !error ? (
        <p>대여 내역이 없습니다.</p>
      ) : (
        <table>
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
                <td>{loan.assetName}</td>
                <td>{loan.serialNumber}</td>
                <td>{loan.loanDate}</td>
                <td>{loan.dueDate}</td>
                <td>{loan.loanStatus}</td>
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
      )}
    </div>
  );
};

export default LoansPage;
