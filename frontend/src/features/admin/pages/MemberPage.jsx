import { useEffect, useState } from "react";

function MemberPage() {
  const [members, setMembers] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    number: 0,
    totalPages: 0,
    first: true,
    last: true,
  });
  const [searchType, setSearchType] = useState("loginId");

  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    fetch("/api/members/search")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setMembers(data.content);
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

  const handleSearch = (pageNumber = 0) => {
    const params = new URLSearchParams();
    if (keyword.trim() !== "") {
      params.append(searchType, keyword.trim());
    }
    params.append("page", pageNumber);
    fetch(`/api/members/search?${params.toString()}`)
      .then((response) => response.json())
      .then((data) => {
        setMembers(data.content);

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
      <h1>회원목록</h1>
      <button onClick={() => handleSearch(0)}> 검색</button>
      <select name="" id="" value={searchType} onChange={onChangeSearchType}>
        <option value="loginId">아이디</option>
        <option value="name">이름</option>
        <option value="departmentName">부서명</option>
      </select>
      <input
        type="text"
        name=""
        value={keyword}
        onChange={onChangeKeyword}
        onKeyDown={onKeyDownKeyword}
        placeholder="검색어"
      />

      {members.map((member) => (
        <div key={member.memberId}>
          <p>회원번호 : {member.memberId}</p>
          <p>아이디 : {member.loginId}</p>
          <p>이름 : {member.name}</p>
          <p>상태 : {member.status}</p>
          <p>부서 : {member.departmentName}</p>
        </div>
      ))}
      <div>
        <button
          onClick={() => handleSearch(pageInfo.number - 1)}
          disabled={pageInfo.first}
        >
          이전
        </button>
        {Array.from({ length: pageInfo.totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => handleSearch(index)}
            disabled={pageInfo.number === index}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => handleSearch(pageInfo.number + 1)}
          disabled={pageInfo.last}
        >
          다음
        </button>
      </div>
    </div>
  );
}

export default MemberPage;
