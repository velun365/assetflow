import { useState, useEffect, useContext } from "react";
import { getCsrfToken } from "../../../shared/api/csrfFetch";
import { AuthContext } from "../../auth/context/AuthContext";

function CategoryAdminPage() {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetch("/api/categories")
      .then((response) => {
        if (!response.ok) {
          throw new Error("카테고리 조회 실패");
        }
        return response.json();
      })
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleDelete = async (categoryId) => {
    const csrfToken = await getCsrfToken();

    fetch(`/api/categories/${categoryId}`, {
      method: "DELETE",
      headers: {
        "X-XSRF-TOKEN": csrfToken,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("카테고리 삭제 실패");
        }
        setCategories((prev) => {
          return prev.filter((category) => category.id !== categoryId);
        });
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const handleSubmit = async () => {
    const csrfToken = await getCsrfToken();

    fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": csrfToken,
      },
      body: JSON.stringify({ name: categoryName }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "카테고리 등록 실패");
        }
        return data;
      })
      .then((data) => {
        setCategories((prev) => [...prev, data]);
        setCategoryName("");
        setErrorMessage("");
      })
      .catch((error) => {
        setErrorMessage(error.message);
        console.error("카테고리 등록 오류 : ", error);
      });
  };
  const onKeyDownKeyword = (e) => {
    if (e.key === "Enter") {
      handleSubmit(0);
    }
  };
  return (
    <div className="page">
      <div className="page-heading"><div><h1>카테고리 관리</h1><p>자산을 분류하는 카테고리를 등록하고 관리합니다.</p></div></div>
      <div className="toolbar admin-search category-create-toolbar">
        <div className="toolbar__group toolbar__group--grow admin-search__query">
          <input
            type="text"
            id="category_name"
            value={categoryName}
            onChange={(e) => {
              setCategoryName(e.target.value);
            }}
            onKeyDown={onKeyDownKeyword}
            placeholder="카테고리명을 입력하세요"
            aria-label="카테고리명"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            handleSubmit();
          }}
        >
          등록
        </button>
      </div>
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <section className="card">
        <div className="card__header"><h2>카테고리 목록</h2></div>
        <div className="category-list">
      {categories.map((category) => (
        <div className="category-row" key={category.id}>
          <p>{category.name}</p>
          {user?.role === "ADMIN" && (
            <button
              type="button"
              className="btn--danger"
              onClick={() => {
                handleDelete(category.id);
              }}
            >
              삭제
            </button>
          )}
        </div>
      ))}
      {categories.length === 0 && <p className="empty-state">등록된 카테고리가 없습니다.</p>}
        </div>
      </section>
    </div>
  );
}

export default CategoryAdminPage;
