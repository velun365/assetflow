import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import StatusBadge from "../../../shared/components/StatusBadge";
import { getCsrfToken } from "../../../shared/api/csrfFetch";

function LoanCreatePage() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState([]);
  const [assets, setAssets] = useState([]);
  const [selectAsset, setSelectAsset] = useState(null);
  const [assetItems, setAssetItems] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const loadCategory = async () => {
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
    loadCategory();
  }, []);

  useEffect(() => {
    const searchAsset = async () => {
      try {
        const response = await fetch("/api/assets/search");
        if (!response.ok) {
          throw new Error("자산목록 조회에 실패하였습니다.");
        }
        const data = await response.json();
        setAssets(data.content);
      } catch (error) {
        setError(error.message);
      }
    };
    searchAsset();
  }, []);
  const filteredAssets = assets.filter((asset) => {
    const matchKeyword = asset.name.includes(searchKeyword);
    const matchesCategory =
      categoryName === "" || asset.categoryName === categoryName;
    return matchKeyword && matchesCategory;
  });

  const chooseAsset = async (asset) => {
    setSelectAsset(asset);
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
  const loanAssetItem = async (assetItem) => {
    const confirmed = window.confirm(
      `${selectAsset.name}을(를) 대여하시겠습니까?`,
    );
    if (!confirmed) {
      return;
    }

    setError("");

    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch("/api/loans", {
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
        throw new Error(data.message || "대여에 실패했습니다.");
      }
      window.alert("대여가 완료되었습니다.");
      navigate("/loans");
    } catch (error) {
      setError(error.message);
    }
  };
  const onChangeCategoryName = (e) => {
    setCategoryName(e.target.value);
  };

  const onChangeKeyword = (e) => {
    setSearchKeyword(e.target.value);
  };

  const goBackToAssets = () => {
    setSelectAsset(null);
    setAssetItems([]);
  };

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>대여 신청</h1>
          <p>대여할 자산을 검색하고 사용 가능한 품목을 선택합니다.</p>
        </div>
      </div>
      {error && <p className="error-message">{error}</p>}
      {selectAsset === null && (
        <section className="toolbar">
          <div className="toolbar__group toolbar__group--grow">
            <select
              aria-label="카테고리"
              value={categoryName}
              onChange={onChangeCategoryName}
            >
              <option value="">전체 카테고리</option>
              {categories.map((list) => (
                <option key={list.id} value={list.name}>
                  {list.name}
                </option>
              ))}
            </select>
            <input
              aria-label="자산 검색어"
              placeholder="자산명을 입력하세요"
              type="text"
              value={searchKeyword}
              onChange={onChangeKeyword}
            />
          </div>
        </section>
      )}
      <section>
        {selectAsset === null ? (
          <div className="asset-grid">
            {filteredAssets.map((asset) => (
              <div
                className="asset-choice-card"
                key={asset.assetId}
                onClick={() => {
                  chooseAsset(asset);
                }}
              >
                <h3>{asset.name}</h3>
                <p>{asset.categoryName}</p>
                <div className="asset-choice-card__meta">
                  <span className="meta-chip">보유 {asset.totalCount}</span>
                  <span className="meta-chip">
                    대여 가능 {asset.availableCount}
                  </span>
                </div>
                <Link
                  className="table-action-link"
                  to={`/admin/assets/${asset.assetId}`}
                  onClick={(event) => event.stopPropagation()}
                >
                  상세보기
                </Link>
              </div>
            ))}
            {filteredAssets.length === 0 && (
              <p className="empty-state card">조건에 맞는 자산이 없습니다.</p>
            )}
          </div>
        ) : (
          <div className="page">
            <div className="selection-header">
              <h2>{selectAsset.name} 품목 선택</h2>
              <button
                className="btn--secondary"
                type="button"
                onClick={goBackToAssets}
              >
                자산 다시 선택
              </button>
            </div>
            <div className="asset-grid">
              {assetItems.map((assetItem) => {
                const canLoan =
                  assetItem.assetItemStatus === "AVAILABLE" &&
                  (!assetItem.hasReadyReservation || assetItem.readyByMe);
                const availabilityLabel = assetItem.hasReadyReservation
                  ? assetItem.readyByMe
                    ? "대여 준비 완료"
                    : "예약자 대여 대기"
                  : null;
                return (
                  <div
                    className="asset-choice-card"
                    key={assetItem.assetItemId}
                  >
                    <h3>{assetItem.serialNumber}</h3>
                    <p>위치: {assetItem.location}</p>
                    <p>
                      {availabilityLabel || (
                        <StatusBadge status={assetItem.assetItemStatus} />
                      )}
                    </p>

                    <button
                      type="button"
                      disabled={!canLoan}
                      onClick={() => {
                        loanAssetItem(assetItem);
                      }}
                    >
                      {assetItem.readyByMe
                        ? "대여하기"
                        : canLoan
                          ? "대여 선택"
                          : "대여 불가"}
                    </button>
                  </div>
                );
              })}
              {assetItems.length === 0 && (
                <p className="empty-state card">등록된 자산 품목이 없습니다.</p>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default LoanCreatePage;
