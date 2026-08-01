import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { fetchAssetItems } from "../api/fetchAssetItems";

const LoanCreatePage = () => {
  const [info, setInfo] = useState({
    memberId: 1,
    assetItemId: "",
  });
  const [assetItems, setAssetItems] = useState([]);

  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadAssetItems = async () => {
      try {
        const data = await fetchAssetItems();
        setAssetItems(data);
      } catch (error) {
        setError(error.message);
      }
    };

    loadAssetItems();
  }, []);

  const onChangeValue = (e) => {
    setInfo({
      ...info,
      assetItemId: Number(e.target.value),
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/loans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(info),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "예약 실패");
      }
      navigate("/loans");
    } catch (error) {
      setError(error.message);
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <select name="" id="" value={info.assetItemId} onChange={onChangeValue}>
          <option value="">자산을 선택하세요.</option>
          {assetItems.map((assetItem) => (
            <option key={assetItem.assetItemId} value={assetItem.assetItemId}>
              자산명/위치: {assetItem.assetName} - {assetItem.location}
            </option>
          ))}
        </select>

        <button type="submit">대여하기</button>
      </form>
    </div>
  );
};

export default LoanCreatePage;
