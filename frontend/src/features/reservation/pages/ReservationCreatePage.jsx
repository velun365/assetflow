import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ReservationCreatePage = () => {
  const memberId = 2; // 로그인 구현 전 임시값

  const [searchKeyword, setSearchKeyword] = useState("");
  const [categoryName, setCategoryName] = useState("");

  const [categories, setCategories] = useState([]);
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assetItems, setAssetItems] = useState([]);

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
    const loadAssets = async () => {
      try {
        const response = await fetch("/api/assets/search");

        if (!response.ok) {
          throw new Error("자산 목록 조회에 실패했습니다.");
        }

        const data = await response.json();
        setAssets(data.content);
      } catch (error) {
        setError(error.message);
      }
    };

    loadAssets();
  }, []);

  const filteredAssets = assets.filter((asset) => {
    const matchesKeyword = asset.name.includes(searchKeyword);

    const matchesCategory =
      categoryName === "" || asset.categoryName === categoryName;

    return matchesKeyword && matchesCategory;
  });

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
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberId,
          assetItemId: assetItem.assetItemId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "예약에 실패했습니다.");
      }

      window.alert("예약이 완료되었습니다.");

      // 사용자용 예약 목록 페이지를 만들면
      // navigate("/reservations")로 변경
      navigate("/");
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
    <div>
      <h1>예약 신청</h1>

      {error && <p>{error}</p>}

      {selectedAsset === null ? (
        <>
          <h2>카테고리 & 자산 검색</h2>

          <section>
            <select
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
              type="text"
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder="자산명을 입력하세요"
            />
          </section>

          <section className="assetsBox">
            {filteredAssets.length === 0 ? (
              <p>조건에 맞는 자산이 없습니다.</p>
            ) : (
              filteredAssets.map((asset) => (
                <div key={asset.assetId} onClick={() => chooseAsset(asset)}>
                  <h3>{asset.name}</h3>
                  <p>분류: {asset.categoryName}</p>
                  <p>보유: {asset.totalCount}</p>
                  <p>대여 가능: {asset.availableCount}</p>
                  <p>예약 대상: {asset.totalCount - asset.availableCount}</p>
                </div>
              ))
            )}
          </section>
        </>
      ) : (
        <section>
          <button type="button" onClick={goBackToAssets}>
            자산 다시 선택
          </button>

          <h2>{selectedAsset.name} 품목 선택</h2>

          {assetItems.length === 0 ? (
            <p>등록된 자산 품목이 없습니다.</p>
          ) : (
            assetItems.map((assetItem) => {
              const isReservable = assetItem.assetItemStatus === "RENTED";

              return (
                <div key={assetItem.assetItemId}>
                  <p>시리얼번호: {assetItem.serialNumber}</p>
                  <p>위치: {assetItem.location}</p>
                  <p>상태: {assetItem.assetItemStatus}</p>

                  <button
                    type="button"
                    disabled={!isReservable}
                    onClick={() => reserveAssetItem(assetItem)}
                  >
                    {isReservable
                      ? "예약하기"
                      : assetItem.assetItemStatus === "AVAILABLE"
                        ? "현재 대여 가능"
                        : "예약 불가"}
                  </button>
                </div>
              );
            })
          )}
        </section>
      )}
    </div>
  );
};

export default ReservationCreatePage;
