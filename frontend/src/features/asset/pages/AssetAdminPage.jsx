import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCsrfToken } from "../../../shared/api/csrfFetch";

const getErrorMessage = async (response, fallbackMessage) => {
  try {
    const data = await response.json();
    return data.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

const fetchCategories = async () => {
  const response = await fetch("/api/categories");

  if (!response.ok) {
    throw new Error("카테고리 조회에 실패했습니다.");
  }

  return response.json();
};

function AssetAdminPage() {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    number: 0,
    totalPages: 0,
    first: true,
    last: true,
  });
  const [searchType, setSearchType] = useState("name");
  const [keyword, setKeyword] = useState("");
  const [appliedSearch, setAppliedSearch] = useState({
    searchType: "name",
    keyword: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editAsset, setEditAsset] = useState({
    name: "",
    explanation: "",
    categoryId: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const applyPage = (data) => {
    setAssets(data.content);
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
        const [assetResponse, categoryData] = await Promise.all([
          fetch("/api/assets/search?page=0"),
          fetchCategories(),
        ]);

        if (!assetResponse.ok) {
          throw new Error("자산 조회에 실패했습니다.");
        }

        applyPage(await assetResponse.json());
        setCategories(categoryData);
      } catch (error) {
        setError(error.message);
      }
    };

    loadInitialData();
  }, []);

  const loadAssets = async (pageNumber, filters = appliedSearch) => {
    try {
      const params = new URLSearchParams();
      const searchKeyword = filters.keyword.trim();

      if (searchKeyword) {
        params.append(filters.searchType, searchKeyword);
      }

      params.append("page", pageNumber);

      const response = await fetch(`/api/assets/search?${params.toString()}`);

      if (!response.ok) {
        throw new Error("자산 조회에 실패했습니다.");
      }

      applyPage(await response.json());
      setError("");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSearch = () => {
    const filters = { searchType, keyword };
    setAppliedSearch(filters);
    setEditingId(null);
    loadAssets(0, filters);
  };

  const startEdit = async (asset) => {
    try {
      setError("");
      setMessage("");

      const categoryData = categories.length
        ? categories
        : await fetchCategories();
      const response = await fetch(`/api/assets/${asset.assetId}`);

      if (!response.ok) {
        throw new Error("자산 상세 조회에 실패했습니다.");
      }

      const detail = await response.json();
      const category = categoryData.find(
        (item) => item.name === detail.categoryName,
      );

      if (!category) {
        throw new Error("현재 자산의 카테고리 정보를 찾을 수 없습니다.");
      }

      if (!categories.length) {
        setCategories(categoryData);
      }

      setEditingId(asset.assetId);
      setEditAsset({
        name: detail.name,
        explanation: detail.explanation ?? "",
        categoryId: String(category.id),
      });
    } catch (error) {
      setError(error.message);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditAsset({ name: "", explanation: "", categoryId: "" });
  };

  const updateAsset = async (assetId) => {
    try {
      setError("");
      setMessage("");

      if (!editAsset.name.trim() || !editAsset.categoryId) {
        throw new Error("자산명과 카테고리를 입력해주세요.");
      }

      const csrfToken = await getCsrfToken();
      const response = await fetch(`/api/assets/${assetId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify({
          name: editAsset.name.trim(),
          explanation: editAsset.explanation,
          categoryId: Number(editAsset.categoryId),
        }),
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "자산 수정에 실패했습니다."),
        );
      }

      cancelEdit();
      setMessage("자산이 수정되었습니다.");
      await loadAssets(pageInfo.number);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>자산 목록</h1>
          <p>자산 종류별 보유 수량과 대여 가능 수량을 확인합니다.</p>
        </div>
        <Link className="btn" to="/admin/assets/new">
          + 자산 등록
        </Link>
      </div>

      <div className="toolbar admin-search">
        <div className="toolbar__group toolbar__group--grow admin-search__query">
          <select
            aria-label="자산 검색 조건"
            value={searchType}
            onChange={(event) => setSearchType(event.target.value)}
          >
            <option value="name">자산명</option>
            <option value="categoryName">카테고리</option>
          </select>
          <input
            type="text"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleSearch()}
            placeholder="검색어를 입력하세요"
          />
        </div>
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
                <th>번호</th>
                <th>자산명</th>
                <th>카테고리</th>
                <th>보유수량</th>
                <th>대여가능수량</th>
                <th className="data-table__action">처리</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <Fragment key={asset.assetId}>
                  <tr>
                    <td>{asset.assetId}</td>
                    <td className="data-table__primary">{asset.name}</td>
                    <td>{asset.categoryName}</td>
                    <td>{asset.totalCount}</td>
                    <td>{asset.availableCount}</td>
                    <td className="data-table__action">
                      <div className="table-actions">
                        <Link
                          className="table-action-link"
                          to={`/admin/assets/${asset.assetId}`}
                        >
                          상세
                        </Link>
                        <button
                          type="button"
                          className="table-action"
                          onClick={() => startEdit(asset)}
                        >
                          수정
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editingId === asset.assetId && (
                    <tr>
                      <td
                        className="table-inline-editor admin-form"
                        colSpan="6"
                      >
                        <div className="form-grid">
                          <div className="form-field">
                            <label htmlFor={`asset-name-${asset.assetId}`}>
                              자산명
                            </label>
                            <input
                              id={`asset-name-${asset.assetId}`}
                              value={editAsset.name}
                              onChange={(event) =>
                                setEditAsset((current) => ({
                                  ...current,
                                  name: event.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="form-field">
                            <label
                              htmlFor={`asset-category-${asset.assetId}`}
                            >
                              카테고리
                            </label>
                            <select
                              id={`asset-category-${asset.assetId}`}
                              value={editAsset.categoryId}
                              onChange={(event) =>
                                setEditAsset((current) => ({
                                  ...current,
                                  categoryId: event.target.value,
                                }))
                              }
                            >
                              <option value="">카테고리 선택</option>
                              {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="form-field form-field--full">
                            <label
                              htmlFor={`asset-explanation-${asset.assetId}`}
                            >
                              설명
                            </label>
                            <input
                              id={`asset-explanation-${asset.assetId}`}
                              value={editAsset.explanation}
                              onChange={(event) =>
                                setEditAsset((current) => ({
                                  ...current,
                                  explanation: event.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                        <div className="form-actions">
                          <button
                            type="button"
                            className="btn--secondary"
                            onClick={cancelEdit}
                          >
                            취소
                          </button>
                          <button
                            type="button"
                            onClick={() => updateAsset(asset.assetId)}
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

        {assets.length === 0 && (
          <p className="empty-state">조회된 자산이 없습니다.</p>
        )}

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
            {Array.from({ length: pageInfo.totalPages }).map((_, index) => (
              <button
                type="button"
                className="pagination__button"
                key={index}
                onClick={() => loadAssets(index)}
                disabled={pageInfo.number === index}
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
      </div>
    </div>
  );
}

export default AssetAdminPage;
