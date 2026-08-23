import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCsrfToken } from "../../../shared/api/csrfFetch";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+$/.test(email);

function SignupPage() {
  const [member, setMember] = useState({
    loginId: "",
    email: "",
    name: "",
    password: "",
  });
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = {};

    if (!member.loginId.trim()) {
      validationErrors.loginId = "아이디를 입력해주세요.";
    }
    if (!member.password.trim()) {
      validationErrors.password = "비밀번호를 입력해주세요.";
    } else if (member.password.length < 8 || member.password.length > 16) {
      validationErrors.password = "비밀번호는 8~16자로 입력해주세요.";
    }
    if (!passwordConfirm.trim()) {
      validationErrors.passwordConfirm = "비밀번호 확인을 입력해주세요.";
    } else if (member.password !== passwordConfirm) {
      validationErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    }
    if (!member.name.trim()) {
      validationErrors.name = "이름을 입력해주세요.";
    }
    if (!member.email.trim()) {
      validationErrors.email = "이메일을 입력해주세요.";
    } else if (!isValidEmail(member.email)) {
      validationErrors.email = "올바른 이메일 형식을 입력해주세요.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setErrorMessage("");
      return;
    }

    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch("/api/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify(member),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const serverMessage = data?.message || "회원 등록에 실패했습니다.";

        if (serverMessage.includes("이미 존재")) {
          setFieldErrors((current) => ({
            ...current,
            loginId: serverMessage,
          }));
          return;
        }

        setErrorMessage(serverMessage);
        return;
      }

      navigate("/login");
    } catch (error) {
      setErrorMessage(error.message || "회원 등록에 실패했습니다.");
    }
  };

  const handleChange = (e) => {
    setErrorMessage("");
    const { name, value } = e.target;
    setMember((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
  };

  const handlePasswordConfirmChange = (e) => {
    setErrorMessage("");
    setPasswordConfirm(e.target.value);
    setFieldErrors((current) => ({ ...current, passwordConfirm: "" }));
  };
  return (
    <div className="page login-page signup-page">
      <form
        className="form-card login-form signup-form"
        onSubmit={handleSubmit}
        noValidate
      >
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
          className={fieldErrors.loginId ? "input--error" : ""}
          aria-invalid={Boolean(fieldErrors.loginId)}
          aria-describedby={fieldErrors.loginId ? "signup-loginId-error" : undefined}
        />
        {fieldErrors.loginId && (
          <p className="field-error-message" id="signup-loginId-error">
            {fieldErrors.loginId}
          </p>
        )}
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
          className={fieldErrors.password ? "input--error" : ""}
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={fieldErrors.password ? "signup-password-error" : undefined}
        />
        {fieldErrors.password && (
          <p className="field-error-message" id="signup-password-error">
            {fieldErrors.password}
          </p>
        )}
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
          className={fieldErrors.passwordConfirm ? "input--error" : ""}
          aria-invalid={Boolean(fieldErrors.passwordConfirm)}
          aria-describedby={
            fieldErrors.passwordConfirm
              ? "signup-password-confirm-error"
              : undefined
          }
        />
        {fieldErrors.passwordConfirm && (
          <p
            className="field-error-message"
            id="signup-password-confirm-error"
          >
            {fieldErrors.passwordConfirm}
          </p>
        )}
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
          className={fieldErrors.name ? "input--error" : ""}
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? "signup-name-error" : undefined}
        />
        {fieldErrors.name && (
          <p className="field-error-message" id="signup-name-error">
            {fieldErrors.name}
          </p>
        )}
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
          className={fieldErrors.email ? "input--error" : ""}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "signup-email-error" : undefined}
        />
        {fieldErrors.email && (
          <p className="field-error-message" id="signup-email-error">
            {fieldErrors.email}
          </p>
        )}
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
