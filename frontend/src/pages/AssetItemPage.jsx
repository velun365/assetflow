import { useEffect, useState } from "react";

const AssetItemPage = () => {
  const [assetItems, setAssetItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAssetItems = async () => {
      try {
        const response = await fetch("/api/asset-items");

        if (!response.ok) {
          throw new Error("자산 아이템 품목 조회에 실패했습니다.");
        }

        const data = await response.json();
        setAssetItems(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchAssetItems();
  }, []);

  // const createAssetItem = async () => {
  //   try{
  //     const response = await fetch("./api/asset-items", {
  //       method : "POST",
  //       headers : {
  //         "Content-Type" :"application/json",
  //       },
  //       body : JSON.stringify({
  //         assetIte
  //       })
  //     })
  //   }
  // }
  return (
    <div>
      <h1>자산 품목 목록</h1>

      {error && <p>{error}</p>}

      {assetItems.map((assetItem) => (
        <div key={assetItem.assetItemId}>
          <p>자산명: {assetItem.assetName}</p>
          <p>위치: {assetItem.location}</p>
          <p>시리얼번호: {assetItem.serialNumber}</p>
          <p>상태: {assetItem.assetItemStatus}</p>
        </div>
      ))}
    </div>
  );
};

export default AssetItemPage;
