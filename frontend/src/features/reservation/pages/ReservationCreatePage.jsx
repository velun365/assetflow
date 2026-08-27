import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../../../shared/components/StatusBadge";
import { getCsrfToken } from "../../../shared/api/csrfFetch";
const ReservationCreatePage = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    name: "",
    categoryName: "",
  });

  const [categories, setCategories] = useState([]);
  const [assets, setAssets] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    number: 0,
    totalPages: 0,
    first: true,
    last: true,
  });
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assetItems, setAssetItems] = useState([]);
  const visibleAssetItems = assetItems.filter(
    (assetItem) => assetItem.assetItemStatus !== "DISPOSED",
  );
  const [error, setError] = useState("");

  const navigate = useNavigate();
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/categories");

        if (!response.ok) {
          throw new Error("카테고리 목록 조회에 실패했습니다.");
        }

        const data = await response.json();
        setCategories(data);
      } catch (error) {
        setError(error.message);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadInitialAssets = async () => {
      try {
        const response = await fetch(
          "/api/assets/search?activeOnly=true&page=0&size=9",
        );

        if (!response.ok) {
          throw new Error("자산 목록 조회에 실패했습니다.");
        }

        const data = await response.json();
        setAssets(data.content);
        setPageInfo({
          number: data.number,
          totalPages: data.totalPages,
          first: data.first,
          last: data.last,
        });
      } catch (error) {
        setError(error.message);
      }
    };

    loadInitialAssets();
  }, []);

  const loadAssets = async (pageNumber, filters = appliedFilters) => {
    try {
      setError("");
      const params = new URLSearchParams();
      params.append("activeOnly", "true");
      const name = filters.name.trim();

      if (name) {
        params.append("name", name);
      }
      if (filters.categoryName) {
        params.append("categoryName", filters.categoryName);
      }
      params.append("page", pageNumber);
      params.append("size", 9);

      const response = await fetch(`/api/assets/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error("자산 목록 조회에 실패했습니다.");
      }

      const data = await response.json();
      setAssets(data.content);
      setPageInfo({
        number: data.number,
        totalPages: data.totalPages,
        first: data.first,
        last: data.last,
      });
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSearch = () => {
    const filters = {
      name: searchKeyword,
      categoryName,
    };
    setAppliedFilters(filters);
    loadAssets(0, filters);
  };

  const chooseAsset = async (asset) => {
    setSelectedAsset(asset);
    setError("");

    try {
      const response = await fetch(`/api/asset-items/${asset.assetId}`);

      if (!response.ok) {
        throw new Error("자산 품목 조회에 실패했습니다.");
      }

      const data = await response.json();
      setAssetItems(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const reserveAssetItem = async (assetItem) => {
    const confirmed = window.confirm(
      `${selectedAsset.name}을(를) 예약하시겠습니까?`,
    );

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify({
          assetItemId: assetItem.assetItemId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "예약에 실패했습니다.");
      }

      window.alert("예약이 완료되었습니다.");

      navigate("/reservations");
    } catch (error) {
      setError(error.message);
    }
  };

  const goBackToAssets = () => {
    setSelectedAsset(null);
    setAssetItems([]);
    setError("");
  };

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>예약 신청</h1>
          <p>현재 대여 중인 자산 품목을 검색하고 예약합니다.</p>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      {selectedAsset === null ? (
        <>
          <section className="toolbar admin-search asset-search-toolbar">
            <div className="toolbar__group toolbar__group--grow admin-search__query">
              <select
                aria-label="카테고리"
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
              >
                <option value="">전체 카테고리</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>

              <input
                aria-label="자산 검색어"
                type="text"
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && handleSearch()}
                placeholder="자산명을 입력하세요"
              />
            </div>
            <button type="button" onClick={handleSearch}>
              검색
            </button>
          </section>

          <section className="asset-grid">
            {assets.length === 0 ? (
              <p className="empty-state card">조건에 맞는 자산이 없습니다.</p>
            ) : (
              assets.map((asset) => (
                <div
                  className="asset-choice-card"
                  key={asset.assetId}
                  onClick={() => chooseAsset(asset)}
                >
                  <h3>{asset.name}</h3>
                  <p>{asset.categoryName}</p>
                  <div className="asset-choice-card__meta">
                    <span className="meta-chip">보유 {asset.totalCount}</span>
                  </div>
                </div>
              ))
            )}
          </section>
          {pageInfo.totalPages > 0 && (
            <div className="pagination">
              <button
                type="button"
                className="pagination__button"
                disabled={pageInfo.first}
                onClick={() => loadAssets(pageInfo.number - 1)}
              >
                이전
              </button>
              {Array.from({ length: pageInfo.totalPages }, (_, index) => (
                <button
                  type="button"
                  className="pagination__button"
                  key={index}
                  disabled={pageInfo.number === index}
                  onClick={() => loadAssets(index)}
                >
                  {index + 1}
                </button>
              ))}
              <button
                type="button"
                className="pagination__button"
                disabled={pageInfo.last}
                onClick={() => loadAssets(pageInfo.number + 1)}
              >
                다음
              </button>
            </div>
          )}
        </>
      ) : (
        <section className="page">
          <div className="selection-header">
            <h2>{selectedAsset.name} 품목 선택</h2>
            <button
              className="btn--secondary"
              type="button"
              onClick={goBackToAssets}
            >
              자산 다시 선택
            </button>
          </div>

          {visibleAssetItems.length === 0 ? (
            <p className="empty-state card">등록된 자산 품목이 없습니다.</p>
          ) : (
            <div className="asset-grid">
              {visibleAssetItems.map((assetItem) => {
                const isReservable =
                  assetItem.assetItemStatus === "RENTED" &&
                  !assetItem.borrowedByMe &&
                  !assetItem.reservedByMe;
                return (
                  <div
                    className="asset-choice-card"
                    key={assetItem.assetItemId}
                  >
                    <h3>{assetItem.serialNumber}</h3>
                    <p>위치: {assetItem.location}</p>
                    <p>
                      {assetItem.borrowedByMe
                        ? "내가 대여 중"
                        : assetItem.reservedByMe
                          ? "이미 예약 중"
                          : assetItem.assetItemStatus === "RENTED"
                            ? "예약 가능"
                            : assetItem.hasReadyReservation
                              ? "예약자 대여 대기"
                              : "현재 대여 가능"}
                    </p>

                    <button
                      type="button"
                      disabled={!isReservable}
                      onClick={() => reserveAssetItem(assetItem)}
                    >
                      {assetItem.borrowedByMe
                        ? "내가 대여 중"
                        : assetItem.reservedByMe
                          ? "이미 예약 중"
                          : isReservable
                            ? "예약하기"
                            : assetItem.hasReadyReservation
                              ? "예약자 대여 대기"
                              : assetItem.assetItemStatus === "AVAILABLE"
                                ? "현재 대여 가능"
                                : "예약 불가"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default ReservationCreatePage;
