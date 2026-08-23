import { Fragment, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAssetItems } from "../api/fetchAssetItems";
import StatusBadge from "../../../shared/components/StatusBadge";
import { getCsrfToken } from "../../../shared/api/csrfFetch";
import { AuthContext } from "../../auth/context/AuthContext";

const getErrorMessage = async (response, fallbackMessage) => {
  try {
    const data = await response.json();
    return data.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

const AssetItemAdminPage = () => {
  const [assetItems, setAssetItems] = useState([]);
  const [assets, setAssets] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    number: 0,
    totalPages: 0,
    first: true,
    last: true,
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [searchType, setSearchType] = useState("serialNumber");
  const [keyword, setKeyword] = useState("");
  const [assetItemStatus, setAssetItemStatus] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editAssetItem, setEditAssetItem] = useState({
    serialNumber: "",
    location: "",
    assetId: "",
  });
  const { user } = useContext(AuthContext);

  const applyPage = (data) => {
    setAssetItems(data.content);
    setPageInfo({
      number: data.number,
      totalPages: data.totalPages,
      first: data.first,
      last: data.last,
    });
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [itemData, assetResponse] = await Promise.all([
          fetchAssetItems(0),
          fetch("/api/assets/search?size=1000"),
        ]);

        if (!assetResponse.ok) {
          throw new Error("자산 목록 조회에 실패했습니다.");
        }

        const assetData = await assetResponse.json();
        applyPage(itemData);
        setAssets(assetData.content);
      } catch (error) {
        setError(error.message);
      }
    };

    loadInitialData();
  }, []);

  const loadAssetItems = async (pageNumber, filters = appliedFilters) => {
    try {
      const data = await fetchAssetItems(pageNumber, filters);
      applyPage(data);
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
    setEditingId(null);
    loadAssetItems(0, filters);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const startEdit = (assetItem) => {
    setError("");
    setMessage("");
    setEditingId(assetItem.assetItemId);
    setEditAssetItem({
      serialNumber: assetItem.serialNumber,
      location: assetItem.location,
      assetId: String(assetItem.assetId),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditAssetItem({ serialNumber: "", location: "", assetId: "" });
  };

  const updateAssetItem = async (assetItemId) => {
    try {
      setError("");
      setMessage("");

      if (
        !editAssetItem.serialNumber.trim() ||
        !editAssetItem.location.trim() ||
        !editAssetItem.assetId
      ) {
        throw new Error("시리얼번호, 위치와 자산을 모두 입력해주세요.");
      }

      const csrfToken = await getCsrfToken();
      const response = await fetch(`/api/asset-items/${assetItemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify({
          serialNumber: editAssetItem.serialNumber.trim(),
          location: editAssetItem.location.trim(),
          assetId: Number(editAssetItem.assetId),
        }),
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "자산 품목 수정에 실패했습니다."),
        );
      }

      cancelEdit();
      setMessage("자산 품목이 수정되었습니다.");
      await loadAssetItems(pageInfo.number);
    } catch (error) {
      setError(error.message);
    }
  };

  const deleteAssetItem = async (assetItemId) => {
    try {
      setError("");
      setMessage("");

      const csrfToken = await getCsrfToken();
      const response = await fetch(`/api/asset-items/${assetItemId}`, {
        method: "DELETE",
        headers: {
          "X-XSRF-TOKEN": csrfToken,
        },
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "자산 품목 폐기에 실패했습니다."),
        );
      }

      setMessage("자산 품목이 폐기되었습니다.");
      await loadAssetItems(pageInfo.number);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>자산 품목 목록</h1>
          <p>개별 자산의 위치, 시리얼번호와 현재 상태를 관리합니다.</p>
        </div>
        <Link className="btn" to="/admin/asset-items/new">
          + 자산 품목 등록
        </Link>
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
      {message && <p className="success-message">{message}</p>}

      <div className="table-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>자산명</th>
                <th>시리얼번호</th>
                <th>위치</th>
                <th>상태</th>
                <th className="data-table__action">처리</th>
              </tr>
            </thead>
            <tbody>
              {assetItems.map((assetItem) => (
                <Fragment key={assetItem.assetItemId}>
                  <tr>
                    <td className="data-table__primary">
                      {assetItem.assetName}
                    </td>
                    <td>{assetItem.serialNumber}</td>
                    <td>{assetItem.location}</td>
                    <td>
                      <StatusBadge status={assetItem.assetItemStatus} />
                    </td>
                    <td className="data-table__action">
                      <div className="table-actions">
                        <button
                          type="button"
                          className="table-action"
                          disabled={["RENTED", "DISPOSED"].includes(
                            assetItem.assetItemStatus,
                          )}
                          onClick={() => startEdit(assetItem)}
                        >
                          수정
                        </button>
                        {user?.role === "ADMIN" &&
                          !["RENTED", "DISPOSED"].includes(
                            assetItem.assetItemStatus,
                          ) && (
                            <button
                              type="button"
                              className="table-action table-action--danger"
                              onClick={() =>
                                deleteAssetItem(assetItem.assetItemId)
                              }
                            >
                              폐기
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                  {editingId === assetItem.assetItemId && (
                    <tr>
                      <td
                        className="table-inline-editor admin-form"
                        colSpan="5"
                      >
                        <div className="form-grid">
                          <div className="form-field">
                            <label
                              htmlFor={`asset-item-serial-${assetItem.assetItemId}`}
                            >
                              시리얼번호
                            </label>
                            <input
                              id={`asset-item-serial-${assetItem.assetItemId}`}
                              value={editAssetItem.serialNumber}
                              onChange={(event) =>
                                setEditAssetItem((current) => ({
                                  ...current,
                                  serialNumber: event.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="form-field">
                            <label
                              htmlFor={`asset-item-location-${assetItem.assetItemId}`}
                            >
                              위치
                            </label>
                            <input
                              id={`asset-item-location-${assetItem.assetItemId}`}
                              value={editAssetItem.location}
                              onChange={(event) =>
                                setEditAssetItem((current) => ({
                                  ...current,
                                  location: event.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="form-field form-field--full">
                            <label
                              htmlFor={`asset-item-asset-${assetItem.assetItemId}`}
                            >
                              소속 자산
                            </label>
                            <select
                              id={`asset-item-asset-${assetItem.assetItemId}`}
                              value={editAssetItem.assetId}
                              onChange={(event) =>
                                setEditAssetItem((current) => ({
                                  ...current,
                                  assetId: event.target.value,
                                }))
                              }
                            >
                              <option value="">자산 선택</option>
                              {assets.map((asset) => (
                                <option
                                  key={asset.assetId}
                                  value={asset.assetId}
                                >
                                  {asset.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="form-actions">
                          <button
                            type="button"
                            className="table-action"
                            onClick={cancelEdit}
                          >
                            취소
                          </button>
                          <button
                            type="button"
                            className="table-action table-action--primary"
                            onClick={() =>
                              updateAssetItem(assetItem.assetItemId)
                            }
                          >
                            저장
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {assetItems.length === 0 && !error && (
          <p className="empty-state">등록된 자산 품목이 없습니다.</p>
        )}

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
