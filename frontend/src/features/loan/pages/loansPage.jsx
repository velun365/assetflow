import { useEffect, useState } from "react";
import { fetchAssetItems } from "../api/fetchAssetItems";

const LoansPage = () => {
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
  return <div></div>;
};

export default LoansPage;
