import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAssetItems } from "../api/fetchAssetItems";
import StatusBadge from "../../../shared/components/StatusBadge";
import { getCsrfToken } from "../../../shared/api/csrfFetch";
import { AuthContext } from "../../auth/context/AuthContext";
const AssetItemAdminPage = () => {
  const [assetItems, setAssetItems] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    number: 0,
    totalPages: 0,
    first: true,
    last: true,
  });
  const [error, setError] = useState("");
  const [searchType, setSearchType] = useState("serialNumber");
  const [keyword, setKeyword] = useState("");
  const [assetItemStatus, setAssetItemStatus] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({});
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const loadAssetItems = async () => {
      try {
        const data = await fetchAssetItems(0);
        setAssetItems(data.content);
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

    loadAssetItems();
  }, []);

  const loadAssetItems = async (pageNumber, filters = appliedFilters) => {
    try {
      const data = await fetchAssetItems(pageNumber, filters);
      setAssetItems(data.content);
      setPageInfo({
        number: data.number,
        totalPages: data.totalPages,
        first: data.first,
        last: data.last,
      });
      setError("");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSearch = () => {
    const filters = {
      searchType,
      keyword,
      assetItemStatus,
    };

    setAppliedFilters(filters);
    loadAssetItems(0, filters);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const deleteAssetItem = async (assetItemId) => {
    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch(`/api/asset-items/${assetItemId}`, {
        method: "DELETE",
        headers: {
          "X-XSRF-TOKEN": csrfToken,
        },
      });
      if (!response.ok) {
        throw new Error("자산 아이템 삭제에 실패했습니다.");
      }

      setAssetItems((prevAssetItem) =>
        prevAssetItem.filter(
          (assetItem) => assetItem.assetItemId !== assetItemId,
        ),
      );
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="page">
      <div className="page-heading">
        <div><h1>자산 품목 목록</h1><p>개별 자산의 위치, 시리얼번호와 현재 상태를 관리합니다.</p></div>
        <Link className="btn" to="/admin/asset-items/new">+ 자산 품목 등록</Link>
      </div>
      <div className="toolbar admin-search">
        <div className="toolbar__group toolbar__group--grow admin-search__query">
          <select
            aria-label="자산 품목 검색 조건"
            value={searchType}
            onChange={(event) => setSearchType(event.target.value)}
          >
            <option value="serialNumber">시리얼번호</option>
            <option value="assetName">자산명</option>
          </select>
          <input
            type="text"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="검색어를 입력하세요"
            aria-label="자산 품목 검색어"
          />
        </div>
        <select
          aria-label="자산 품목 상태"
          value={assetItemStatus}
          onChange={(event) => setAssetItemStatus(event.target.value)}
        >
          <option value="">전체 상태</option>
          <option value="AVAILABLE">대여 가능</option>
          <option value="RENTED">대여 중</option>
          <option value="BROKEN">고장</option>
          <option value="DISPOSED">폐기</option>
        </select>
        <button type="button" onClick={handleSearch}>
          검색
        </button>
      </div>
      {error && <p className="error-message">{error}</p>}
      <div className="table-card">
      <div className="table-scroll"><table className="data-table">
        <thead><tr><th>품목번호</th><th>자산명</th><th>시리얼번호</th><th>위치</th><th>상태</th><th className="data-table__action">처리</th></tr></thead>
        <tbody>
      {assetItems.map((assetItem) => (
        <tr key={assetItem.assetItemId}>
          <td>{assetItem.assetItemId}</td>
          <td className="data-table__primary">{assetItem.assetName}</td>
          <td>{assetItem.serialNumber}</td>
          <td>{assetItem.location}</td>
          <td><StatusBadge status={assetItem.assetItemStatus} /></td>
          <td className="data-table__action">
            {user?.role === "ADMIN" ? (
              <button
                type="button"
                className="table-action table-action--danger"
                onClick={() => {
                  deleteAssetItem(assetItem.assetItemId);
                }}
              >
                삭제
              </button>
            ) : (
              "-"
            )}
          </td>
        </tr>
      ))}
        </tbody>
      </table></div>
      {assetItems.length === 0 && !error && <p className="empty-state">등록된 자산 품목이 없습니다.</p>}
      {pageInfo.totalPages > 0 && (
        <div className="pagination">
          <button
            type="button"
            className="pagination__button"
            disabled={pageInfo.first}
            onClick={() => loadAssetItems(pageInfo.number - 1)}
          >
            이전
          </button>
          {Array.from({ length: pageInfo.totalPages }).map((_, index) => (
            <button
              type="button"
              className="pagination__button"
              key={index}
              disabled={pageInfo.number === index}
              onClick={() => loadAssetItems(index)}
            >
              {index + 1}
            </button>
          ))}
          <button
            type="button"
            className="pagination__button"
            disabled={pageInfo.last}
            onClick={() => loadAssetItems(pageInfo.number + 1)}
          >
            다음
          </button>
        </div>
      )}
      </div>
    </div>
  );
};

export default AssetItemAdminPage;
