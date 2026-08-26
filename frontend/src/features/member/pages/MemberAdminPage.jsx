import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../auth/context/AuthContext";
import StatusBadge from "../../../shared/components/StatusBadge";
import { getCsrfToken } from "../../../shared/api/csrfFetch";

function MemberAdminPage() {
  const { user } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [pageInfo, setPageInfo] = useState({
    number: 0,
    totalPages: 0,
    first: true,
    last: true,
  });

  const [searchType, setSearchType] = useState("loginId");
  const [keyword, setKeyword] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    searchType: "loginId",
    keyword: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editDepartmentId, setEditDepartmentId] = useState("");
  const [editStatus, setEditStatus] = useState("ACTIVE");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadMembers = async (pageNumber = 0, filters = appliedFilters) => {
    const params = new URLSearchParams();

    if (filters.keyword.trim() !== "") {
      params.append(filters.searchType, filters.keyword.trim());
    }

    params.append("page", pageNumber);
    params.append("size", 10);

    const response = await fetch(`/api/members/search?${params.toString()}`);

    if (!response.ok) {
      throw new Error("회원 목록 조회에 실패했습니다.");
    }

    const data = await response.json();

    setMembers(data.content);
    setPageInfo({
      number: data.number,
      totalPages: data.totalPages,
      first: data.first,
      last: data.last,
    });
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [membersResponse, departmentsResponse] = await Promise.all([
          fetch("/api/members/search?page=0&size=10"),
          fetch("/api/departments"),
        ]);

        if (!membersResponse.ok) {
          throw new Error("회원 목록 조회에 실패했습니다.");
        }

        if (!departmentsResponse.ok) {
          throw new Error("부서 목록 조회에 실패했습니다.");
        }

        const membersData = await membersResponse.json();
        const departmentsData = await departmentsResponse.json();

        setMembers(membersData.content);
        setPageInfo({
          number: membersData.number,
          totalPages: membersData.totalPages,
          first: membersData.first,
          last: membersData.last,
        });

        setDepartments(departmentsData);
      } catch (error) {
        setError(error.message);
      }
    };

    loadInitialData();
  }, []);

  const handleSearch = async () => {
    const filters = { searchType, keyword };
    setAppliedFilters(filters);

    try {
      setError("");
      setMessage("");

      await loadMembers(0, filters);
    } catch (error) {
      setError(error.message);
    }
  };

  const handlePageChange = async (pageNumber) => {
    try {
      setError("");
      setMessage("");

      await loadMembers(pageNumber);
    } catch (error) {
      setError(error.message);
    }
  };

  const startEdit = (member) => {
    setEditingId(member.memberId);

    setEditDepartmentId(
      member.departmentId != null ? String(member.departmentId) : "",
    );

    setEditStatus(member.status);

    setError("");
    setMessage("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDepartmentId("");
    setEditStatus("ACTIVE");
  };

  const updateMember = async (memberId) => {
    try {
      setError("");
      setMessage("");

      const csrfToken = await getCsrfToken();

      const response = await fetch(`/api/members/${memberId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify({
          departmentId:
            editDepartmentId === "" ? null : Number(editDepartmentId),
          status: editStatus,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(data?.message || "회원 정보 수정에 실패했습니다.");
      }

      setEditingId(null);
      setEditDepartmentId("");
      setEditStatus("ACTIVE");

      setMessage("회원 정보가 수정되었습니다.");

      await loadMembers(pageInfo.number);
    } catch (error) {
      setError(error.message);
    }
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
    <div className="page admin-list-page">
      <div className="page-heading">
        <div>
          <h1>회원 목록</h1>
          <p>등록된 회원의 계정 상태와 소속 부서를 관리합니다.</p>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}

      <div className="toolbar admin-search">
        <div className="toolbar__group toolbar__group--grow admin-search__query">
          <select
            aria-label="회원 검색 조건"
            value={searchType}
            onChange={onChangeSearchType}
          >
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

        <button type="button" onClick={handleSearch}>
          검색
        </button>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          <table className="data-table member-admin-table">
            <colgroup>
              <col className="member-admin-table__login-id" />
              <col className="member-admin-table__name" />
              <col className="member-admin-table__status" />
              <col className="member-admin-table__department" />
              <col className="member-admin-table__action" />
            </colgroup>
            <thead>
              <tr>
                <th>아이디</th>
                <th>이름</th>
                <th>상태</th>
                <th>부서</th>
                <th className="data-table__action">관리</th>
              </tr>
            </thead>

            <tbody>
              {members.map((member) => {
                const isEditing = editingId === member.memberId;
                const isSelf = user?.memberId === member.memberId;
                return (
                  <tr key={member.memberId}>
                    <td className="data-table__primary">{member.loginId}</td>

                    <td>{member.name}</td>

                    <td>
                      {isEditing ? (
                        <select
                          className="table-edit-select"
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          disabled={isSelf}
                          title={
                            isSelf ? "본인 계정 상태는 변경할 수 없습니다." : ""
                          }
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="SUSPENDED">SUSPENDED</option>
                        </select>
                      ) : (
                        <StatusBadge status={member.status} />
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <select
                          className="table-edit-select"
                          value={editDepartmentId}
                          onChange={(e) => setEditDepartmentId(e.target.value)}
                        >
                          <option value="">미지정</option>

                          {departments.map((department) => (
                            <option
                              key={department.departmentId}
                              value={department.departmentId}
                            >
                              {department.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        member.departmentName || "미지정"
                      )}
                    </td>

                    <td className="data-table__action">
                      {user?.role === "ADMIN" &&
                        (isEditing ? (
                          <div className="table-actions">
                            <button
                              type="button"
                              className="table-action table-action--primary"
                              onClick={() => updateMember(member.memberId)}
                            >
                              저장
                            </button>

                            <button
                              type="button"
                              className="table-action"
                              onClick={cancelEdit}
                            >
                              취소
                            </button>
                          </div>
                        ) : (
                          <div className="table-actions">
                            <button
                              type="button"
                              className="table-action"
                              onClick={() => startEdit(member)}
                            >
                              수정
                            </button>
                          </div>
                        ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {members.length === 0 && (
          <p className="empty-state">등록된 회원이 없습니다.</p>
        )}
      </div>

      <div className="pagination">
        <button
          type="button"
          className="pagination__button"
          onClick={() => handlePageChange(pageInfo.number - 1)}
          disabled={pageInfo.first}
        >
          이전
        </button>

        {Array.from({ length: pageInfo.totalPages }, (_, index) => (
          <button
            type="button"
            className="pagination__button"
            key={index}
            onClick={() => handlePageChange(index)}
            disabled={pageInfo.number === index}
          >
            {index + 1}
          </button>
        ))}

        <button
          type="button"
          className="pagination__button"
          onClick={() => handlePageChange(pageInfo.number + 1)}
          disabled={pageInfo.last}
        >
          다음
        </button>
      </div>
    </div>
  );
}

export default MemberAdminPage;
