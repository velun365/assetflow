import { useEffect, useState } from "react";
import { getCsrfToken } from "../../../shared/api/csrfFetch";

const getErrorMessage = async (response, fallbackMessage) => {
  try {
    const data = await response.json();
    return data.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

function DepartmentAdminPage() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadDepartments = async () => {
    try {
      const response = await fetch("/api/departments");

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "부서 목록 조회에 실패했습니다."),
        );
      }

      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadInitialDepartments = async () => {
      try {
        const response = await fetch("/api/departments");

        if (!response.ok) {
          throw new Error(
            await getErrorMessage(response, "부서 목록 조회에 실패했습니다."),
          );
        }

        const data = await response.json();

        if (!ignore) {
          setDepartments(data);
        }
      } catch (error) {
        if (!ignore) {
          setError(error.message);
        }
      }
    };

    loadInitialDepartments();

    return () => {
      ignore = true;
    };
  }, []);

  const createDepartment = async () => {
    try {
      setError("");
      setMessage("");

      if (!name.trim()) {
        throw new Error("부서명을 입력해주세요.");
      }

      const csrfToken = await getCsrfToken();
      const response = await fetch("/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "부서 등록에 실패했습니다."),
        );
      }

      setName("");
      setMessage("부서가 등록되었습니다.");
      await loadDepartments();
    } catch (error) {
      setError(error.message);
    }
  };

  const startEdit = (department) => {
    setEditingId(department.departmentId);
    setEditingName(department.name);
    setError("");
    setMessage("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const updateDepartment = async (departmentId) => {
    try {
      setError("");
      setMessage("");

      if (!editingName.trim()) {
        throw new Error("부서명을 입력해주세요.");
      }

      const csrfToken = await getCsrfToken();
      const response = await fetch(`/api/departments/${departmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify({ name: editingName.trim() }),
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "부서 수정에 실패했습니다."),
        );
      }

      setEditingId(null);
      setEditingName("");
      setMessage("부서가 수정되었습니다.");
      await loadDepartments();
    } catch (error) {
      setError(error.message);
    }
  };

  const deleteDepartment = async (departmentId) => {
    if (!window.confirm("이 부서를 삭제하시겠습니까?")) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const csrfToken = await getCsrfToken();
      const response = await fetch(`/api/departments/${departmentId}`, {
        method: "DELETE",
        headers: { "X-XSRF-TOKEN": csrfToken },
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "부서 삭제에 실패했습니다."),
        );
      }

      setMessage("부서가 삭제되었습니다.");
      await loadDepartments();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>부서 관리</h1>
          <p>회원에게 지정할 부서를 등록하고 관리합니다.</p>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}

      <div className="toolbar">
        <div className="toolbar__group toolbar__group--grow">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="부서명을 입력하세요"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                createDepartment();
              }
            }}
          />
        </div>
        <button type="button" onClick={createDepartment}>등록</button>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr><th>부서번호</th><th>부서명</th><th>관리</th></tr>
            </thead>
            <tbody>
              {departments.map((department) => (
                <tr key={department.departmentId}>
                  <td>{department.departmentId}</td>
                  <td>
                    {editingId === department.departmentId ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                      />
                    ) : (
                      <span className="data-table__primary">{department.name}</span>
                    )}
                  </td>
                  <td>
                    {editingId === department.departmentId ? (
                      <>
                        <button type="button" onClick={() => updateDepartment(department.departmentId)}>저장</button>
                        <button type="button" onClick={cancelEdit}>취소</button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => startEdit(department)}>수정</button>
                        <button type="button" onClick={() => deleteDepartment(department.departmentId)}>삭제</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {departments.length === 0 && (
          <p className="empty-state">등록된 부서가 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export default DepartmentAdminPage;
