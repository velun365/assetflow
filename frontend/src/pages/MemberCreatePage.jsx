import { useState } from "react";
import { useNavigate } from "react-router-dom";

function MemberCreatePage() {
  const [member, setMember] = useState({
    loginId: "",
    email: "",
    name: "",
    password: "",
  });

  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = () => {
    fetch("/api/members", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(member),
    })
      .then(async (response) => {
        const data = await response.json();
        console.log("상태코드 :", response.status);
        console.log("응답데이터", data);

        if (!response.ok) {
          throw new Error(data.message || "회원 등록 실패");
        }
        return data;
      })
      .then((data) => {
        console.log("회원 등록 성공 : ", data);
        navigate("/members");
      })
      .catch((error) => {
        setErrorMessage(error.message);
        console.error("회원 등록 오류 : ", error);
      });
  };
  const handleChange = (e) => {
    setErrorMessage("");
    setMember({ ...member, [e.target.name]: e.target.value });
  };
  return (
    <div>
      <h1>회원 가입</h1>
      <div>
        <label htmlFor="loginId">아이디</label>
        <input
          id="loginId"
          type="text"
          name="loginId"
          value={member.loginId}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="email">이메일</label>
        <input
          id="email"
          type="email"
          name="email"
          value={member.email}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="name">이름</label>
        <input
          id="name"
          type="text"
          name="name"
          value={member.name}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="password">비밀번호</label>
        <input
          id="password"
          type="password"
          name="password"
          value={member.password}
          onChange={handleChange}
        />
      </div>
      {errorMessage && <p>{errorMessage}</p>}
      <button onClick={handleSubmit}>회원 등록</button>
    </div>
  );
}

export default MemberCreatePage;
