import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LoanPage = () => {
  const [loans, setLoans] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadLoans = async () => {
      try {
        const response = await fetch("/api/loans");
        if (!response.ok) {
          throw new Error("대여조회에 실패했습니다.");
        }
        const data = await response.json();
        setLoans(data);
      } catch (error) {
        console.error(error);
      }
    };
    loadLoans();
  }, []);
  const handleApproveReturn = async (loanId) => {
    try {
      const response = await fetch(`/api/loans/${loanId}/return-approve`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("반납 승인에 실패했습니다.");
      }
      const updateLoan = await response.json();

      setLoans((prevLoans) =>
        prevLoans.map((loan) =>
          loan.loanId === loanId
            ? {
                ...loan,
                loanStatus: updateLoan.loanStatus,
                returnDate: updateLoan.returnDate,
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
      <h1>대여 전체 조회</h1>

      {error && <p>{error}</p>}

      {loans.length === 0 && !error && <p>대여 내역이 없습니다.</p>}

      {loans.map((loan) => (
        <div key={loan.loanId}>
          <p>대여번호 : {loan.loanId}</p>
          <p>대여상태 : {loan.loanStatus}</p>

          <p>회원 : {loan.memberName}</p>

          <p>자산명 : {loan.assetName}</p>
          <p>자산품목번호 : {loan.assetItemId}</p>
          <p>관리번호 : {loan.serialNumber}</p>

          <p>대여일 : {loan.loanDate}</p>
          <p>반납예정일 : {loan.dueDate}</p>
          <p>실제반납일 : {loan.returnDate ?? "미반납"}</p>

          {loan.loanStatus === "RETURN_REQUESTED" && (
            <button onClick={() => handleApproveReturn(loan.loanId)}>
              반납 승인
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default LoanPage;
