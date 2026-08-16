import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCsrfToken } from "../../../shared/api/csrfFetch";

function SignupPage() {
  const [member, setMember] = useState({
    loginId: "",
    email: "",
    name: "",
    password: "",
  });
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (member.password !== passwordConfirm) {
      setErrorMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    const csrfToken = await getCsrfToken();

    fetch("/api/members", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": csrfToken,
      },
      body: JSON.stringify(member),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "회원 등록 실패");
        }
        return data;
      })
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        setErrorMessage(error.message);
      });
  };
  const handleChange = (e) => {
    setErrorMessage("");
    setMember({ ...member, [e.target.name]: e.target.value });
  };
  const handlePasswordConfirmChange = (e) => {
    setErrorMessage("");
    setPasswordConfirm(e.target.value);
  };
  return (
    <div className="page login-page signup-page">
      <form className="form-card login-form signup-form" onSubmit={handleSubmit}>
        <div className="login-form__intro">
          <h1>회원가입</h1>
          <p>서비스 이용을 위한 계정 정보를 입력합니다.</p>
        </div>
      <div className="form-field">
        <label htmlFor="loginId">아이디</label>
        <input
          id="loginId"
          type="text"
          name="loginId"
          value={member.loginId}
          onChange={handleChange}
          placeholder="아이디를 입력하세요"
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="password">비밀번호</label>
        <input
          id="password"
          type="password"
          name="password"
          value={member.password}
          onChange={handleChange}
          placeholder="8~16자의 비밀번호를 입력하세요"
          minLength={8}
          maxLength={16}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="passwordConfirm">비밀번호 확인</label>
        <input
          id="passwordConfirm"
          type="password"
          value={passwordConfirm}
          onChange={handlePasswordConfirmChange}
          placeholder="비밀번호를 다시 입력하세요"
          minLength={8}
          maxLength={16}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="name">이름</label>
        <input
          id="name"
          type="text"
          name="name"
          value={member.name}
          onChange={handleChange}
          placeholder="이름을 입력하세요"
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="email">이메일</label>
        <input
          id="email"
          type="email"
          name="email"
          value={member.email}
          onChange={handleChange}
          placeholder="이메일을 입력하세요"
          required
        />
      </div>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button className="login-form__submit" type="submit">
          회원가입
        </button>
        <p className="login-form__signup">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </form>
    </div>
  );
}

export default SignupPage;
