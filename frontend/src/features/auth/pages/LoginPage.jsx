import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCsrfToken } from "../../../shared/api/csrfFetch";
import { AuthContext } from "../context/AuthContext";

function LoginPage() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const { setUser } = useContext(AuthContext);

  const onChangeId = (e) => {
    setLoginId(e.target.value);
  };

  const onChangePassword = (e) => {
    setPassword(e.target.value);
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    const csrfToken = await getCsrfToken();

    const loginResponse = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": csrfToken,
      },
      body: JSON.stringify({
        loginId: loginId,
        password: password,
      }),
    });

    const loginData = await loginResponse.json();

    if (loginResponse.ok) {
      const meResponse = await fetch("/api/auth/me");
      const meData = await meResponse.json();

      setUser(meData);
      navigate("/");
    } else {
      setErrorMessage(loginData.message);
    }
  };

  return (
    <div className="page login-page">
      <form className="form-card login-form" onSubmit={handleLogin}>
        <div className="login-form__intro">
          <h1>로그인</h1>
          <p>계정 정보를 입력해 로그인합니다.</p>
        </div>
        <div className="form-field">
          <label htmlFor="loginId">아이디</label>
          <input
            type="text"
            name="loginId"
            id="loginId"
            placeholder="아이디를 입력하세요"
            value={loginId}
            onChange={onChangeId}
          />
        </div>
        <div className="form-field">
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={onChangePassword}
          />
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button className="login-form__submit" type="submit">
          로그인
        </button>
        <p className="login-form__signup">
          계정이 없으신가요? <Link to="/signup">회원가입</Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
