import { useEffect, useState } from "react";
import StatusBadge from "../../../shared/components/StatusBadge";
import { getCsrfToken } from "../../../shared/api/csrfFetch";

const LoanAdminPage = () => {
  const [loans, setLoans] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    number: 0,
    totalPages: 0,
    first: true,
    last: true,
  });

  const [searchType, setSearchType] = useState("memberName");
  const [keyword, setKeyword] = useState("");
  const [loanStatus, setLoanStatus] = useState("");
  const [loanDateFrom, setLoanDateFrom] = useState("");
  const [loanDateTo, setLoanDateTo] = useState("");

  const [error, setError] = useState("");

  const loadLoans = async (pageNumber = 0) => {
    try {
      setError("");
      const params = new URLSearchParams();

      // 회원명 또는 자산품목 번호
      if (keyword.trim() !== "") {
        params.append(searchType, keyword.trim());
      }

      // 대여 상태
      if (loanStatus !== "") {
        params.append("loanStatus", loanStatus);
      }

      // 대여 시작일
      if (loanDateFrom !== "") {
        params.append("loanDateFrom", loanDateFrom);
      }

      // 대여 종료일
      if (loanDateTo !== "") {
        params.append("loanDateTo", loanDateTo);
      }

      params.append("page", pageNumber);
      params.append("size", 10);

      const response = await fetch(`/api/loans/search?${params.toString()}`);

      if (!response.ok) {
        throw new Error("대여 조회에 실패했습니다.");
      }

      const data = await response.json();

      setLoans(data.content);

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
    fetch("/api/loans/search?page=0&size=10")
      .then((response) => {
        if (!response.ok) {
          throw new Error("대여 조회에 실패했습니다.");
        }
        return response.json();
      })
      .then((data) => {
        setLoans(data.content);
        setPageInfo({
          number: data.number,
          totalPages: data.totalPages,
          first: data.first,
          last: data.last,
        });
      })
      .catch((error) => {
        setError(error.message);
      });
  }, []);

  const handleApproveReturn = async (loanId) => {
    try {
      setError("");

      const csrfToken = await getCsrfToken();
      const response = await fetch(`/api/loans/${loanId}/return-approve`, {
        method: "POST",
        headers: {
          "X-XSRF-TOKEN": csrfToken,
        },
      });

      if (!response.ok) {
        throw new Error("반납 승인에 실패했습니다.");
      }

      const updatedLoan = await response.json();

      setLoans((prevLoans) =>
        prevLoans.map((loan) =>
          loan.loanId === loanId
            ? {
                ...loan,
                loanStatus: updatedLoan.loanStatus,
                returnDate: updatedLoan.returnDate,
              }
            : loan,
        ),
      );
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSearch = () => {
    loadLoans(0);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      loadLoans(0);
    }
  };

  const handleReset = () => {
    setSearchType("memberName");
    setKeyword("");
    setLoanStatus("");
    setLoanDateFrom("");
    setLoanDateTo("");

    // 상태 변경은 즉시 반영되지 않으므로 전체 조회를 직접 요청
    loadAllLoans();
  };

  const loadAllLoans = async () => {
    try {
      setError("");

      const response = await fetch("/api/loans/search?page=0&size=10");

      if (!response.ok) {
        throw new Error("대여 조회에 실패했습니다.");
      }

      const data = await response.json();

      setLoans(data.content);

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

  return (
    <div className="page">
      <div className="page-heading"><div><h1>전체 대여 관리</h1><p>대여 상태를 검색하고 접수된 반납 요청을 승인합니다.</p></div></div>

      <div className="toolbar admin-search">
        <div className="toolbar__group toolbar__group--grow admin-search__query">
        <select
          aria-label="대여 검색 조건"
          value={searchType}
          onChange={(event) => setSearchType(event.target.value)}
        >
          <option value="memberName">회원명</option>
          <option value="assetItemId">자산품목 번호</option>
        </select>

        <input
          aria-label="대여 검색어"
          type={searchType === "assetItemId" ? "number" : "text"}
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            searchType === "memberName"
              ? "회원명을 입력하세요"
              : "자산품목 번호를 입력하세요"
          }
        />
        </div>

        <select
          aria-label="대여 상태"
          value={loanStatus}
          onChange={(event) => setLoanStatus(event.target.value)}
        >
          <option value="">전체 상태</option>
          <option value="RENTED">대여 중</option>
          <option value="OVERDUE">연체</option>
          <option value="RETURN_REQUESTED">반납 요청</option>
          <option value="RETURNED">반납 완료</option>
        </select>

        <label className="toolbar__date">
          대여일 시작
          <input
            type="date"
            value={loanDateFrom}
            onChange={(event) => setLoanDateFrom(event.target.value)}
          />
        </label>

        <label className="toolbar__date">
          대여일 종료
          <input
            type="date"
            value={loanDateTo}
            onChange={(event) => setLoanDateTo(event.target.value)}
          />
        </label>

        <button type="button" onClick={handleSearch}>
          검색
        </button>

        <button className="btn--secondary" type="button" onClick={handleReset}>
          초기화
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="table-card">
      {loans.length === 0 && !error ? (
        <p className="empty-state">대여 내역이 없습니다.</p>
      ) : (
        <div className="table-scroll"><table className="data-table">
          <thead>
            <tr>
              <th>회원</th>
              <th>자산명</th>
              <th>대여일</th>
              <th>반납예정일</th>
              <th>실제반납일</th>
              <th>상태</th>
              <th className="data-table__action">처리</th>
            </tr>
          </thead>

          <tbody>
            {loans.map((loan) => (
              <tr key={loan.loanId}>
                <td className="data-table__primary">{loan.memberName}</td>
                <td>{loan.assetName}</td>
                <td>{loan.loanDate}</td>
                <td>{loan.dueDate}</td>
                <td>{loan.returnDate ?? "미반납"}</td>
                <td><StatusBadge status={loan.loanStatus} /></td>
                <td className="data-table__action">
                  {loan.loanStatus === "RETURN_REQUESTED" ? (
                    <div className="table-actions">
                      <button
                        type="button"
                        className="table-action table-action--primary"
                        onClick={() => handleApproveReturn(loan.loanId)}
                      >
                        반납 승인
                      </button>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}

      {pageInfo.totalPages > 0 && (
        <div className="pagination">
          <button
            type="button"
            className="pagination__button"
            disabled={pageInfo.first}
            onClick={() => loadLoans(pageInfo.number - 1)}
          >
            이전
          </button>

          {Array.from({ length: pageInfo.totalPages }).map((_, index) => (
            <button
              type="button"
              className="pagination__button"
              key={index}
              disabled={pageInfo.number === index}
              onClick={() => loadLoans(index)}
            >
              {index + 1}
            </button>
          ))}

          <button
            type="button"
            className="pagination__button"
            disabled={pageInfo.last}
            onClick={() => loadLoans(pageInfo.number + 1)}
          >
            다음
          </button>
        </div>
      )}
      </div>
    </div>
  );
};

export default LoanAdminPage;
