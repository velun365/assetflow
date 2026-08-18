export const fetchAssetItems = async (pageNumber = 0, filters = {}) => {
  const params = new URLSearchParams();
  const keyword = filters.keyword?.trim();

  if (keyword && filters.searchType) {
    params.append(filters.searchType, keyword);
  }

  if (filters.assetItemStatus) {
    params.append("assetItemStatus", filters.assetItemStatus);
  }

  params.append("page", pageNumber);
  params.append("size", 10);

  const response = await fetch(`/api/asset-items?${params.toString()}`);

  if (!response.ok) {
    throw new Error("자산 아이템 품목 조회에 실패했습니다.");
  }

  return response.json();
};
