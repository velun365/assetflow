export const fetchAssetItems = async (pageNumber = 0) => {
  const response = await fetch(`/api/asset-items?page=${pageNumber}&size=10`);

  if (!response.ok) {
    throw new Error("자산 아이템 품목 조회에 실패했습니다.");
  }

  return response.json();
};
