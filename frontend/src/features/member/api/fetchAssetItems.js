export const fetchAssetItems = async () => {
  const response = await fetch("/api/asset-items");

  if (!response.ok) {
    throw new Error("자산 아이템 품목 조회에 실패했습니다.");
  }

  return response.json();
};
