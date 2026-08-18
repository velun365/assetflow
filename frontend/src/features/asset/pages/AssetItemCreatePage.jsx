import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCsrfToken } from "../../../shared/api/csrfFetch";

const AssetItemCreatePage = () => {
  const [assetItem, setAssetItem] = useState({
    assetId: "",
    serialNumber: "",
    location: "",
  });
  const [assets, setAssets] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch("/api/assets/search");
        if (!response.ok) {
          throw new Error("자산 목록 조회 실패");
        }
        const data = await response.json();

        setAssets(data.content);
      } catch (error) {
        setError(error.message);
      }
    };
    fetchAssets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch("/api/asset-items", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify(assetItem),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "자산 품목 등록 실패");
      }

      navigate("/admin/asset-items");
    } catch (error) {
      setError(error.message);
    }
  };
  const onChangeAssetItems = (e) => {
    const { name, value } = e.target;
    setAssetItem({
      ...assetItem,
      [name]: name === "assetId" && value !== "" ? Number(value) : value,
    });
  };
  return (
    <div className="page">
      <div className="page-heading"><div><h1>자산 품목 등록</h1><p>자산에 속하는 개별 품목의 식별 정보를 입력합니다.</p></div></div>
      <form className="form-card admin-form" onSubmit={handleSubmit}>
        <div className="form-grid">
        <div className="form-field form-field--full">
        <label htmlFor="assetId">자산</label>
        <select
          id="assetId"
          name="assetId"
          value={assetItem.assetId}
          onChange={onChangeAssetItems}
        >
          <option value="">자산선택</option>
          {assets.map((asset) => (
            <option key={asset.assetId} value={asset.assetId}>
              {asset.name}
            </option>
          ))}
        </select>
        </div>
        <div className="form-field">
          <label htmlFor="serialNumber">시리얼 번호</label>
          <input
            type="text"
            id="serialNumber"
            name="serialNumber"
            value={assetItem.serialNumber}
            onChange={onChangeAssetItems}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="location">위치</label>
          <input
            type="text"
            id="location"
            name="location"
            value={assetItem.location}
            onChange={onChangeAssetItems}
            required
          />
        </div>
        </div>
        {error && <p className="error-message">{error}</p>}
        <div className="form-actions"><button type="submit">등록하기</button></div>
      </form>
    </div>
  );
};

export default AssetItemCreatePage;
