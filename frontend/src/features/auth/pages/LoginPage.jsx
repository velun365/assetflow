import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCsrfToken } from "../../../shared/api/csrfFetch";
import { AuthContext } from "../context/AuthContext";

function LoginPage() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const { setUser } = useContext(AuthContext);

  const onChangeId = (e) => {
    setLoginId(e.target.value);
    setFieldErrors((current) => ({ ...current, loginId: "" }));
    setErrorMessage("");
  };

  const onChangePassword = (e) => {
    setPassword(e.target.value);
    setFieldErrors((current) => ({ ...current, password: "" }));
    setErrorMessage("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const validationErrors = {};

    if (!loginId.trim()) {
      validationErrors.loginId = "아이디를 입력해주세요.";
    }
    if (!password.trim()) {
      validationErrors.password = "비밀번호를 입력해주세요.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setErrorMessage("");
      return;
    }

    try {
      const csrfToken = await getCsrfToken();
      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify({
          loginId,
          password,
        }),
      });

      const loginData = await loginResponse.json().catch(() => null);

      if (!loginResponse.ok) {
        setErrorMessage(
          loginData?.message || "로그인 처리 중 오류가 발생했습니다.",
        );
        return;
      }

      const meResponse = await fetch("/api/auth/me");
      if (!meResponse.ok) {
        throw new Error("로그인 정보 조회에 실패했습니다.");
      }
      const meData = await meResponse.json();

      setUser(meData);
      navigate("/");
    } catch (error) {
      setErrorMessage(error.message || "로그인 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="page login-page">
      <form className="form-card login-form" onSubmit={handleLogin} noValidate>
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
            className={fieldErrors.loginId ? "input--error" : ""}
            aria-invalid={Boolean(fieldErrors.loginId)}
            aria-describedby={
              fieldErrors.loginId ? "loginId-error" : undefined
            }
          />
          {fieldErrors.loginId && (
            <p className="field-error-message" id="loginId-error">
              {fieldErrors.loginId}
            </p>
          )}
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
            className={fieldErrors.password ? "input--error" : ""}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password ? "login-password-error" : undefined
            }
          />
          {fieldErrors.password && (
            <p className="field-error-message" id="login-password-error">
              {fieldErrors.password}
            </p>
          )}
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
