import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../auth/context/AuthContext";
import { getCsrfToken } from "../../../shared/api/csrfFetch";

const getErrorMessage = async (response, fallbackMessage) => {
  try {
    const data = await response.json();
    return data.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+$/.test(email);

const MyPage = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [memberInfo, setMemberInfo] = useState(null);
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [infoFieldErrors, setInfoFieldErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [passwordCurrent, setPasswordCurrent] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [passwordFieldErrors, setPasswordFieldErrors] = useState({});
  useEffect(() => {
    const loadInfo = async () => {
      try {
        setError("");

        const response = await fetch("/api/members/me");

        if (!response.ok) {
          throw new Error(
            await getErrorMessage(response, "회원 정보 조회에 실패했습니다."),
          );
        }

        const data = await response.json();

        setMemberInfo(data);
        setEmail(data.email);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadInfo();
  }, []);

  const updateMyInfo = async () => {
    setError("");
    setMessage("");

    const validationErrors = {};

    if (!email.trim()) {
      validationErrors.email = "이메일을 입력해주세요.";
    } else if (!isValidEmail(email)) {
      validationErrors.email = "올바른 이메일 형식을 입력해주세요.";
    }

    if (!currentPassword.trim()) {
      validationErrors.currentPassword = "현재 비밀번호를 입력해주세요.";
    }

    setInfoFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      const csrfToken = await getCsrfToken();

      const response = await fetch("/api/members/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify({
          email,
          currentPassword,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "회원 정보 수정에 실패했습니다."),
        );
      }

      setMemberInfo((current) => (current ? { ...current, email } : current));
      setCurrentPassword("");
      setInfoFieldErrors({});
      setMessage("회원 정보가 수정되었습니다.");
    } catch (error) {
      setError(error.message);
    }
  };
  const changePassword = async () => {
    setError("");
    setMessage("");

    const validationErrors = {};

    if (!passwordCurrent.trim()) {
      validationErrors.passwordCurrent = "현재 비밀번호를 입력해주세요.";
    }

    if (!newPassword.trim()) {
      validationErrors.newPassword = "새 비밀번호를 입력해주세요.";
    } else if (newPassword.length < 8 || newPassword.length > 16) {
      validationErrors.newPassword = "비밀번호는 8~16자로 입력해주세요.";
    }

    if (!newPasswordConfirm.trim()) {
      validationErrors.newPasswordConfirm =
        "새 비밀번호 확인을 입력해주세요.";
    } else if (newPassword !== newPasswordConfirm) {
      validationErrors.newPasswordConfirm =
        "새 비밀번호가 일치하지 않습니다.";
    }

    setPasswordFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      const csrfToken = await getCsrfToken();

      const response = await fetch("/api/members/me/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify({
          currentPassword: passwordCurrent,
          newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "비밀번호 변경에 실패했습니다."),
        );
      }

      setPasswordCurrent("");
      setNewPassword("");
      setNewPasswordConfirm("");
      setPasswordFieldErrors({});

      setUser(null);

      alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
      navigate("/login", { replace: true });
    } catch (error) {
      setError(error.message);
    }
  };
  const role = memberInfo?.role || user?.role;
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>내 정보</h1>
          <p>회원 정보를 확인하고 수정합니다.</p>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}

      <section className="card my-profile-card">
        <div className="card__header">
          <h2>내 정보</h2>
        </div>
        <div className="my-profile-summary">
          <div>
            <span>아이디</span>
            <strong>{memberInfo?.loginId || user?.loginId || "-"}</strong>
          </div>

          <div>
            <span>이름</span>
            <strong>{memberInfo?.name || user?.name || "-"}</strong>
          </div>

          <div>
            <span>소속 부서</span>
            <strong>{memberInfo?.departmentName || "미지정"}</strong>
          </div>

          {(role === "ADMIN" || role === "MANAGER") && (
            <div>
              <span>권한</span>
              <strong
                className={`role-badge role-badge--${role.toLowerCase()}`}
              >
                {role}
              </strong>
            </div>
          )}
        </div>
      </section>

      {loading ? (
        <p className="empty-state">회원 정보를 불러오는 중입니다.</p>
      ) : (
        <div className="my-page-forms">
          <section className="form-card admin-form my-page-form">
            <h2>회원 정보 수정</h2>
            <div className="form-grid">
              <div className="form-field form-field--full">
                <label htmlFor="email">이메일</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setInfoFieldErrors((current) => ({
                      ...current,
                      email: "",
                    }));
                    setError("");
                  }}
                  className={infoFieldErrors.email ? "input--error" : ""}
                  aria-invalid={Boolean(infoFieldErrors.email)}
                  aria-describedby={
                    infoFieldErrors.email ? "my-email-error" : undefined
                  }
                  required
                />
                {infoFieldErrors.email && (
                  <p className="field-error-message" id="my-email-error">
                    {infoFieldErrors.email}
                  </p>
                )}
              </div>
              <div className="form-field form-field--full">
                <label htmlFor="currentPassword">현재 비밀번호</label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => {
                    setCurrentPassword(event.target.value);
                    setInfoFieldErrors((current) => ({
                      ...current,
                      currentPassword: "",
                    }));
                    setError("");
                  }}
                  className={
                    infoFieldErrors.currentPassword ? "input--error" : ""
                  }
                  aria-invalid={Boolean(infoFieldErrors.currentPassword)}
                  aria-describedby={
                    infoFieldErrors.currentPassword
                      ? "my-current-password-error"
                      : undefined
                  }
                  required
                />
                {infoFieldErrors.currentPassword && (
                  <p
                    className="field-error-message"
                    id="my-current-password-error"
                  >
                    {infoFieldErrors.currentPassword}
                  </p>
                )}
              </div>
            </div>
            <div className="form-actions">
              <button type="button" onClick={updateMyInfo}>
                정보 수정
              </button>
            </div>
          </section>

          <section className="form-card admin-form my-page-form">
            <h2>비밀번호 변경</h2>
            <div className="form-grid">
              <div className="form-field form-field--full">
                <label htmlFor="passwordCurrent">현재 비밀번호</label>
                <input
                  id="passwordCurrent"
                  type="password"
                  value={passwordCurrent}
                  onChange={(event) => {
                    setPasswordCurrent(event.target.value);
                    setPasswordFieldErrors((current) => ({
                      ...current,
                      passwordCurrent: "",
                    }));
                    setError("");
                  }}
                  className={
                    passwordFieldErrors.passwordCurrent ? "input--error" : ""
                  }
                  aria-invalid={Boolean(
                    passwordFieldErrors.passwordCurrent,
                  )}
                  aria-describedby={
                    passwordFieldErrors.passwordCurrent
                      ? "my-password-current-error"
                      : undefined
                  }
                  required
                />
                {passwordFieldErrors.passwordCurrent && (
                  <p
                    className="field-error-message"
                    id="my-password-current-error"
                  >
                    {passwordFieldErrors.passwordCurrent}
                  </p>
                )}
              </div>
              <div className="form-field form-field--full">
                <label htmlFor="newPassword">새 비밀번호</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value);
                    setPasswordFieldErrors((current) => ({
                      ...current,
                      newPassword: "",
                      newPasswordConfirm: "",
                    }));
                    setError("");
                  }}
                  className={
                    passwordFieldErrors.newPassword ? "input--error" : ""
                  }
                  aria-invalid={Boolean(passwordFieldErrors.newPassword)}
                  aria-describedby={
                    passwordFieldErrors.newPassword
                      ? "my-new-password-error"
                      : undefined
                  }
                  minLength={8}
                  maxLength={16}
                  required
                />
                {passwordFieldErrors.newPassword && (
                  <p
                    className="field-error-message"
                    id="my-new-password-error"
                  >
                    {passwordFieldErrors.newPassword}
                  </p>
                )}
              </div>
              <div className="form-field form-field--full">
                <label htmlFor="newPasswordConfirm">새 비밀번호 확인</label>
                <input
                  id="newPasswordConfirm"
                  type="password"
                  value={newPasswordConfirm}
                  onChange={(event) => {
                    setNewPasswordConfirm(event.target.value);
                    setPasswordFieldErrors((current) => ({
                      ...current,
                      newPasswordConfirm: "",
                    }));
                    setError("");
                  }}
                  className={
                    passwordFieldErrors.newPasswordConfirm
                      ? "input--error"
                      : ""
                  }
                  aria-invalid={Boolean(
                    passwordFieldErrors.newPasswordConfirm,
                  )}
                  aria-describedby={
                    passwordFieldErrors.newPasswordConfirm
                      ? "my-new-password-confirm-error"
                      : undefined
                  }
                  minLength={8}
                  maxLength={16}
                  required
                />
                {passwordFieldErrors.newPasswordConfirm && (
                  <p
                    className="field-error-message"
                    id="my-new-password-confirm-error"
                  >
                    {passwordFieldErrors.newPasswordConfirm}
                  </p>
                )}
              </div>
            </div>
            <div className="form-actions">
              <button type="button" onClick={changePassword}>
                비밀번호 변경
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default MyPage;
