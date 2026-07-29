import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAssetItems } from "../api/fetchAssetItems";
const AssetItemPage = () => {
  const [assetItems, setAssetItems] = useState([]);
  const [error, setError] = useState("");

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

  const deleteAssetItem = async (assetItemId) => {
    try {
      const response = await fetch(`/api/asset-items/${assetItemId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error("자산 아이템 품목 조회에 실패했습니다.");
      }

      setAssetItems(
        assetItems.filter((assetItem) => assetItem.assetItemId !== assetItemId),
      );
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h1>자산 품목 목록</h1>
      <Link to="/asset-items/new">자산 품목 등록하기</Link>
      {error && <p>{error}</p>}

      {assetItems.map((assetItem) => (
        <div key={assetItem.assetItemId}>
          <p>자산명: {assetItem.assetName}</p>
          <p>위치: {assetItem.location}</p>
          <p>시리얼번호: {assetItem.serialNumber}</p>
          <p>상태: {assetItem.assetItemStatus}</p>
          <button
            onClick={() => {
              deleteAssetItem(assetItem.assetItemId);
            }}
          >
            삭제
          </button>
        </div>
      ))}
    </div>
  );
};

export default AssetItemPage;
