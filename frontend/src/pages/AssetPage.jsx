import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function AssetPage() {
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
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
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
      handleSearch();
    }
  };

  return (
    <div>
      <h1>자산 목록</h1>
      <Link to="/assets/new">자산등록 </Link>
      <select name="" id="" value={searchType} onChange={onChangeSearchType}>
        <option value="name">자산명</option>
        <option value="assetType">자산유형</option>
        <option value="categoryName">카테고리</option>
      </select>
      <input
        type="text"
        name=""
        value={keyword}
        onChange={onChangeKeyword}
        onKeyDown={onKeyDownKeyword}
        placeholder="검색어"
      ></input>
      <button onClick={() => handleSearch(0)}>검색</button>
      {assets.map((asset) => (
        <div key={asset.assetId}>
          <p>번호 : {asset.assetId}</p>
          <p>자산명 : {asset.name}</p>
          <p>자산 유형 : {asset.assetType}</p>
          <p>카테고리 : {asset.categoryName}</p>
        </div>
      ))}
      <div>
        <button
          disabled={pageInfo.first}
          onClick={() => handleSearch(pageInfo.number - 1)}
        >
          이전
        </button>
        {Array.from({ length: pageInfo.totalPages }).map((_, index) => (
          <button
            key={index}
            onClick={() => handleSearch(index)}
            disabled={pageInfo.number === index}
          >
            {index + 1}
          </button>
        ))}
        <button
          disabled={pageInfo.last}
          onClick={() => handleSearch(pageInfo.number + 1)}
        >
          다음
        </button>
      </div>
    </div>
  );
}

export default AssetPage;
