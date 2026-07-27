import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AssetCreatePage = () => {
  const [asset, setAsset] = useState({
    categoryId: "",
    name: "",
    explanation: "",
  });
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const handleSubmit = () => {
    fetch("/api/assets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(asset),
    })
      .then(async (response) => {
        const data = await response.json();
        console.log("상태코드 : " + response.status);
        console.log("응답데이터 : " + data);

        if (!response.ok) {
          throw new Error(data.message || "자산 등록 실패");
        }
        return data;
      })
      .then((data) => {
        navigate("/assets");
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

  return (
    <div>
      <h1>자산 등록</h1>
      <div>
        <label htmlFor="categoryId">카테고리</label>
        <select
          name="categoryId"
          id="categoryId"
          value={asset.categoryId}
          onChange={onChangeAsset}
        >
          <option value="">카테고리 선택</option>
          <option value="1">전자기기</option>
          <option value="2">사무용품</option>
          <option value="3">문구</option>
        </select>
      </div>
      <div>
        <label htmlFor="name">자산명</label>
        <input
          id="name"
          type="text"
          name="name"
          value={asset.name}
          onChange={onChangeAsset}
        />
      </div>
      <div>
        <label htmlFor="explanation">설명</label>
        <input
          id="explanation"
          type="text"
          name="explanation"
          value={asset.explanation}
          onChange={onChangeAsset}
        />
      </div>
      <button onClick={handleSubmit}>자산 등록</button>

      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
};

export default AssetCreatePage;
