import { useContext, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AuthContext } from "../../features/auth/context/AuthContext";

const adminSections = [
  {
    id: "assets",
    title: "자산 관리",
    links: [
      { to: "/admin/assets", label: "자산 목록" },
      { to: "/admin/asset-items", label: "자산 품목" },
      { to: "/admin/categories", label: "카테고리" },
    ],
  },
  {
    id: "adminLoans",
    title: "대여 관리",
    links: [{ to: "/admin/loans", label: "관리자 대여 현황" }],
  },
  {
    id: "adminReservations",
    title: "예약 관리",
    links: [{ to: "/admin/reservations", label: "관리자 예약 현황" }],
  },
  {
    id: "members",
    title: "회원 관리",
    links: [{ to: "/admin/members", label: "회원 목록" }],
  },
];

const userSections = [
  {
    id: "userLoans",
    title: "대여",
    links: [
      { to: "/loans/new", label: "대여 신청" },
      { to: "/loans", label: "내 대여 목록", end: true },
    ],
  },
  {
    id: "userReservations",
    title: "예약",
    links: [
      { to: "/reservations/new", label: "예약 신청" },
      { to: "/reservations", label: "내 예약 목록", end: true },
    ],
  },
];

const getOpenGroups = (pathname) => ({
  assets:
    pathname === "/admin/assets" ||
    pathname.startsWith("/admin/assets/") ||
    pathname === "/admin/asset-items" ||
    pathname === "/admin/asset-items/new" ||
    pathname === "/admin/categories",
  adminLoans: pathname === "/admin/loans",
  adminReservations: pathname === "/admin/reservations",
  members: pathname === "/admin/members",
  userLoans: pathname === "/loans" || pathname === "/loans/new",
  userReservations:
    pathname === "/reservations" || pathname === "/reservations/new",
});

const SidebarLink = ({ to, label, end, nested = false }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `sidebar-link${nested ? " sidebar-link--nested" : ""}${
        isActive ? " sidebar-link--active" : ""
      }`
    }
  >
    <span>{label}</span>
  </NavLink>
);

const AccordionGroup = ({ section, isOpen, onToggle }) => (
  <section className="sidebar-section">
    <button
      type="button"
      className="sidebar-section__toggle"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls={`sidebar-group-${section.id}`}
    >
      <span>{section.title}</span>
      <span className="sidebar-section__chevron" aria-hidden="true">
        {isOpen ? "⌄" : "›"}
      </span>
    </button>
    {isOpen && (
      <div
        className="sidebar-section__links"
        id={`sidebar-group-${section.id}`}
      >
        {section.links.map((link) => (
          <SidebarLink key={link.to} {...link} nested />
        ))}
      </div>
    )}
  </section>
);

const Sidebar = () => {
  const { pathname } = useLocation();
  const { user } = useContext(AuthContext);
  const [groupOverrides, setGroupOverrides] = useState({});
  const routeOpenGroups = getOpenGroups(pathname);
  const currentOverrides = groupOverrides[pathname] || {};

  const isGroupOpen = (groupId) =>
    currentOverrides[groupId] ?? routeOpenGroups[groupId];

  const toggleGroup = (groupId) => {
    setGroupOverrides((current) => {
      const pathOverrides = current[pathname] || {};
      const currentValue = pathOverrides[groupId] ?? routeOpenGroups[groupId];

      return {
        ...current,
        [pathname]: {
          ...pathOverrides,
          [groupId]: !currentValue,
        },
      };
    });
  };

  return (
    <aside className="app-sidebar">
      <NavLink to="/" className="brand" aria-label="AssetFlow 홈">
        <span>
          <strong>AssetFlow</strong>
          <small>Asset Management</small>
        </span>
      </NavLink>

      {user && (
        <nav className="sidebar-nav" aria-label="주요 메뉴">
          <SidebarLink to="/" label="대시보드" end />

          {(user.role === "ADMIN" || user.role === "MANAGER") && (
            <>
              <p className="sidebar-role-label">관리자 메뉴</p>
              {adminSections.map((section) => (
                <AccordionGroup
                  key={section.id}
                  section={section}
                  isOpen={isGroupOpen(section.id)}
                  onToggle={() => toggleGroup(section.id)}
                />
              ))}
            </>
          )}

          <p className="sidebar-role-label sidebar-role-label--user">
            사용자 메뉴
          </p>
          {userSections.map((section) => (
            <AccordionGroup
              key={section.id}
              section={section}
              isOpen={isGroupOpen(section.id)}
              onToggle={() => toggleGroup(section.id)}
            />
          ))}
        </nav>
      )}
    </aside>
  );
};

export default Sidebar;
