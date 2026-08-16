import { useEffect, useState } from "react";
import StatusBadge from "../../../shared/components/StatusBadge";

function MemberAdminPage() {
  const [members, setMembers] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    number: 0,
    totalPages: 0,
    first: true,
    last: true,
  });
  const [searchType, setSearchType] = useState("loginId");

  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    fetch("/api/members/search")
      .then((response) => response.json())
      .then((data) => {
        setMembers(data.content);
        setPageInfo({
          number: data.number,
          totalPages: data.totalPages,
          first: data.first,
          last: data.last,
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleSearch = (pageNumber = 0) => {
    const params = new URLSearchParams();
    if (keyword.trim() !== "") {
      params.append(searchType, keyword.trim());
    }
    params.append("page", pageNumber);
    fetch(`/api/members/search?${params.toString()}`)
      .then((response) => response.json())
      .then((data) => {
        setMembers(data.content);

        setPageInfo({
          number: data.number,
          totalPages: data.totalPages,
          first: data.first,
          last: data.last,
        });
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const onChangeSearchType = (e) => {
    setSearchType(e.target.value);
  };
  const onChangeKeyword = (e) => {
    setKeyword(e.target.value);
  };
  const onKeyDownKeyword = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>회원 목록</h1>
          <p>등록된 회원의 계정 상태와 소속 부서를 조회합니다.</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar__group toolbar__group--grow">
          <select aria-label="회원 검색 조건" value={searchType} onChange={onChangeSearchType}>
            <option value="loginId">아이디</option>
            <option value="name">이름</option>
            <option value="departmentName">부서명</option>
          </select>
          <input
            type="text"
            value={keyword}
            onChange={onChangeKeyword}
            onKeyDown={onKeyDownKeyword}
            placeholder="검색어를 입력하세요"
            aria-label="회원 검색어"
          />
        </div>
        <button type="button" onClick={() => handleSearch(0)}>검색</button>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>회원번호</th><th>아이디</th><th>이름</th><th>상태</th><th>부서</th></tr></thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.memberId}>
                  <td>{member.memberId}</td>
                  <td className="data-table__primary">{member.loginId}</td>
                  <td>{member.name}</td>
                  <td><StatusBadge status={member.status} /></td>
                  <td>{member.departmentName || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {members.length === 0 && <p className="empty-state">등록된 회원이 없습니다.</p>}
        <div className="pagination">
        <button
          type="button"
          className="pagination__button"
          onClick={() => handleSearch(pageInfo.number - 1)}
          disabled={pageInfo.first}
        >
          이전
        </button>
        {Array.from({ length: pageInfo.totalPages }, (_, index) => (
          <button
            type="button"
            className="pagination__button"
            key={index}
            onClick={() => handleSearch(index)}
            disabled={pageInfo.number === index}
          >
            {index + 1}
          </button>
        ))}
        <button
          type="button"
          className="pagination__button"
          onClick={() => handleSearch(pageInfo.number + 1)}
          disabled={pageInfo.last}
        >
          다음
        </button>
        </div>
      </div>
    </div>
  );
}

export default MemberAdminPage;
