import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function AssetAdminPage() {
  const [assets, setAssets] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    number: 0,
    totalPages: 0,
    first: true,
    last: true,
  });

  const [searchType, setSearchType] = useState("name");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    fetch("/api/assets/search")
      .then((response) => {
        if (!response.ok) {
          throw new Error("자산 조회에 실패했습니다.");
        }

        return response.json();
      })
      .then((data) => {
        setAssets(data.content);
        setPageInfo({
          number: data.number,
          totalPages: data.totalPages,
          first: data.first,
          last: data.last,
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleSearch = (pageNumber) => {
    const params = new URLSearchParams();
    params.append(searchType, keyword);
    params.append("page", pageNumber);
    fetch(`/api/assets/search?${params.toString()}`)
      .then((response) => response.json())
      .then((data) => {
        setAssets(data.content);
        setPageInfo({
          number: data.number,
          totalPages: data.totalPages,
          first: data.first,
          last: data.last,
        });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const onChangeSearchType = (e) => {
    setSearchType(e.target.value);
  };

  const onChangeKeyword = (e) => {
    setKeyword(e.target.value);
  };

  const onKeyDownKeyword = (e) => {
    if (e.key === "Enter") {
      handleSearch(0);
    }
  };

  return (
    <div className="page">
      <div className="page-heading">
        <div><h1>자산 목록</h1><p>자산 종류별 보유 수량과 대여 가능 수량을 확인합니다.</p></div>
        <Link className="btn" to="/admin/assets/new">+ 자산 등록</Link>
      </div>
      <div className="toolbar">
      <div className="toolbar__group toolbar__group--grow">
      <select aria-label="자산 검색 조건" value={searchType} onChange={onChangeSearchType}>
        <option value="name">자산명</option>
        <option value="categoryName">카테고리</option>
      </select>
      <input
        type="text"
        value={keyword}
        onChange={onChangeKeyword}
        onKeyDown={onKeyDownKeyword}
        placeholder="검색어"
      />
      </div>
      <button type="button" onClick={() => handleSearch(0)}>검색</button>
      </div>
      <div className="table-card">
      <div className="table-scroll"><table className="data-table">
        <thead>
          <tr>
            <th>번호</th>
            <th>자산명</th>
            <th>카테고리</th>
            <th>보유수량</th>
            <th>대여가능수량</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset.assetId}>
              <td>{asset.assetId}</td>
              <td>
                <Link className="data-table__link" to={`/admin/assets/${asset.assetId}`}>{asset.name}</Link>
              </td>
              <td>{asset.categoryName}</td>
              <td>{asset.totalCount}</td>
              <td>{asset.availableCount}</td>
            </tr>
          ))}
        </tbody>
      </table></div>
      {assets.length === 0 && <p className="empty-state">조회된 자산이 없습니다.</p>}
      <div className="pagination">
        <button
          type="button"
          className="pagination__button"
          disabled={pageInfo.first}
          onClick={() => handleSearch(pageInfo.number - 1)}
        >
          이전
        </button>
        {Array.from({ length: pageInfo.totalPages }).map((_, index) => (
          <button
            type="button"
            className="pagination__button"
            key={index}
            onClick={() => handleSearch(index)}
            disabled={pageInfo.number === index}
          >
            {index + 1}
          </button>
        ))}
        <button
          type="button"
          className="pagination__button"
          disabled={pageInfo.last}
          onClick={() => handleSearch(pageInfo.number + 1)}
        >
          다음
        </button>
      </div>
      </div>
    </div>
  );
}

export default AssetAdminPage;
