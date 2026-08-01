import { useState, useEffect } from "react";

function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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

  const handleDelete = (categoryId) => {
    fetch(`/api/categories/${categoryId}`, {
      method: "DELETE",
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
  const handleSubmit = () => {
    fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: categoryName }),
    })
      .then(async (response) => {
        const data = await response.json();
        console.log("상태코드 : " + response.status);
        console.log("응답데이터 : " + data);

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
  return (
    <div>
      <h1>카테고리 목록</h1>
      {categories.map((category) => (
        <div key={category.id}>
          <p>{category.name}</p>
          <button
            onClick={() => {
              handleDelete(category.id);
            }}
          >
            삭제
          </button>
        </div>
      ))}
      <div>
        <p>카테고리명</p>
        <label htmlFor="category_name"></label>
        <input
          type="text"
          id="category_name"
          value={categoryName}
          onChange={(e) => {
            setCategoryName(e.target.value);
          }}
          placeholder="추가할 카테고리를 입력하세요"
        />
        <button
          onClick={() => {
            handleSubmit();
          }}
        >
          등록
        </button>
      </div>
    </div>
  );
}

export default CategoryPage;
