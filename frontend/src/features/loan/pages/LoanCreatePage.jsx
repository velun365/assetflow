import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  if (error) {
    return <p>{error}</p>;
  }

  const filteredAssets = assets.filter((asset) => {
    const matchKeyword = asset.name.includes(searchKeyword);
    const matchesCategory =
      categoryName === "" || asset.categoryName === categoryName;
    return matchKeyword && matchesCategory;
  });

  const chooseAsset = async (asset) => {
    setSelectAsset(asset);
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

    try {
      const response = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: 1,
          assetItemId: assetItem.assetItemId,
        }),
      });
      if (!response.ok) {
        throw new Error("대여에 실패했습니다.");
      }
      const data = await response.json();
      console.log(data);

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
    <div>
      <h1>대여신청</h1>
      <section className=""></section>
      <h2>카테고리 & 자산검색</h2>
      <section className="">
        <div>
          <select
            name={categoryName}
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
        </div>
        <div>
          <input type="text" value={searchKeyword} onChange={onChangeKeyword} />
        </div>
      </section>
      <section className="">
        {selectAsset === null ? (
          <div className="assetsBox">
            {filteredAssets.map((asset) => (
              <div
                key={asset.assetId}
                onClick={() => {
                  chooseAsset(asset);
                }}
              >
                <h3>{asset.name}</h3>
                <p>분류 : {asset.categoryName}</p>
                <p>보유 : {asset.totalCount}</p>
                <p>대여가능 : {asset.availableCount}</p>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <button type="button" onClick={goBackToAssets}>
              자산 다시 선택
            </button>
            {assetItems.map((assetItem) => {
              const isAvailable = assetItem.assetItemStatus === "AVAILABLE";
              return (
                <div key={assetItem.assetItemId}>
                  <p>시리얼번호: {assetItem.serialNumber}</p>
                  <p>위치: {assetItem.location}</p>
                  <p>상태: {assetItem.assetItemStatus}</p>

                  <button
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => {
                      loanAssetItem(assetItem);
                    }}
                  >
                    {isAvailable ? "대여 선택" : "대여 불가"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default LoanCreatePage;
