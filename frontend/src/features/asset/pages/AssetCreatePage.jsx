import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCsrfToken } from "../../../shared/api/csrfFetch";

const AssetCreatePage = () => {
  const [asset, setAsset] = useState({
    categoryId: "",
    name: "",
    explanation: "",
  });
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const handleSubmit = async () => {
    const csrfToken = await getCsrfToken();

    const formData = new FormData();

    formData.append(
      "request",
      new Blob(
        [
          JSON.stringify({
            ...asset,
            categoryId: Number(asset.categoryId),
          }),
        ],
        { type: "application/json" },
      ),
    );
    if (image) {
      formData.append("image", image);
    }

    fetch("/api/assets", {
      method: "POST",
      headers: {
        "X-XSRF-TOKEN": csrfToken,
      },
      body: formData,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "자산 등록 실패");
        }
        return data;
      })
      .then(() => {
        navigate("/admin/assets");
      })
      .catch((error) => {
        setErrorMessage(error.message);
        console.error("자산 등록 오류 : ", error);
      });
  };

  const onChangeAsset = (e) => {
    setAsset({
      ...asset,
      [e.target.name]: e.target.value,
    });
  };
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
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>자산 등록</h1>
          <p>관리할 자산의 분류와 기본 정보를 입력합니다.</p>
        </div>
      </div>
      <div className="form-card admin-form">
        <div className="form-grid">
          <div className="form-field form-field--full">
            <label htmlFor="categoryId">카테고리</label>
            <select
              name="categoryId"
              id="categoryId"
              onChange={onChangeAsset}
              value={asset.categoryId}
            >
              <option value="">카테고리 선택</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field form-field--full">
            <label htmlFor="name">자산명</label>
            <input
              id="name"
              type="text"
              name="name"
              value={asset.name}
              onChange={onChangeAsset}
            />
          </div>
          <div className="form-field form-field--full">
            <label htmlFor="explanation">설명</label>
            <input
              id="explanation"
              type="text"
              name="explanation"
              value={asset.explanation}
              onChange={onChangeAsset}
            />
          </div>
          <div className="form-field form-field--full">
            <label htmlFor="image">대표 이미지</label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0] || null)}
            />
          </div>
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <div className="form-actions">
          <button type="button" onClick={handleSubmit}>
            자산 등록
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetCreatePage;
