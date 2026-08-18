import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../features/auth/context/AuthContext";
import { getCsrfToken } from "../api/csrfFetch";

const Header = () => {
  const navigate = useNavigate();
  const { user, setUser, loading } = useContext(AuthContext);

  const handleLogout = async () => {
    const confirmed = window.confirm("로그아웃을 하시겠습니까?");
    if (!confirmed) {
      return;
    }
    const csrfToken = await getCsrfToken();
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "X-XSRF-TOKEN": csrfToken,
      },
    });
    if (response.ok) {
      setUser(null);
      navigate("/login");
    }
  };

  return (
    <header className="app-header">
      {!loading && user && (
        <div className="header-user">
          <Link className="header-user__name" to="/me">
            {user.name}님
          </Link>
          <Link className="header-user__link" to="/me">
            내 정보
          </Link>
          <button className="header-user__logout" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
