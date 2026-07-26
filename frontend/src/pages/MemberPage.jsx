import { useEffect, useState } from "react";

function MemberPage() {
  const [members, setMembers] = useState([]);
  const [condition, setCondition] = useState({
    loginId: "",
    name: "",
    departmentName: "",
  });
  useEffect(() => {
    fetch("/api/members/search")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setMembers(data.content);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);
  const handleChange = (e) => {
    setCondition({
      ...condition,
      [e.target.name]: e.target.value,
    });
  };
  const handleSearch = () => {
    const params = new URLSearchParams();
    params.append("loginId", condition.loginId);
    params.append("name", condition.name);
    params.append("departmentName", condition.departmentName);

    fetch(`/api/members/search?${params.toString()}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setMembers(data.content);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div>
      <h1>회원목록</h1>
      <button onClick={handleSearch}> 검색</button>
      <input
        type="text"
        name="loginId"
        value={condition.loginId}
        onChange={handleChange}
        placeholder="아이디"
      />

      <input
        type="text"
        name="name"
        value={condition.name}
        onChange={handleChange}
        placeholder="이름"
      />

      <input
        type="text"
        name="departmentName"
        value={condition.departmentName}
        onChange={handleChange}
        placeholder="부서명"
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
    </div>
  );
}

export default MemberPage;
