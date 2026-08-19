import { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../features/auth/context/AuthContext";

const adminSections = [
  {
    id: "assets",
    title: "자산 관리",
    links: [
      { to: "/admin/assets", label: "자산 목록", matchChildren: true },
      {
        to: "/admin/asset-items",
        label: "자산 품목",
        matchChildren: true,
      },
      { to: "/admin/categories", label: "카테고리" },
    ],
  },
  {
    id: "adminLoans",
    title: "대여 관리",
    links: [{ to: "/admin/loans", label: "대여 현황" }],
  },
  {
    id: "adminReservations",
    title: "예약 관리",
    links: [{ to: "/admin/reservations", label: "예약 현황" }],
  },
  {
    id: "members",
    title: "회원 관리",
    links: [
      { to: "/admin/members", label: "회원 목록" },
      { to: "/admin/departments", label: "부서 관리" },
    ],
  },
];

const userSections = [
  {
    id: "userLoans",
    title: "대여",
    links: [
      { to: "/loans/new", label: "대여 신청" },
      { to: "/loans", label: "내 대여 목록" },
    ],
  },
  {
    id: "userReservations",
    title: "예약",
    links: [
      { to: "/reservations/new", label: "예약 신청" },
      { to: "/reservations", label: "내 예약 목록" },
    ],
  },
];

const allSections = [...adminSections, ...userSections];

const isPathActive = (pathname, link) =>
  pathname === link.to ||
  (link.matchChildren && pathname.startsWith(`${link.to}/`));

const getActiveGroupId = (pathname) =>
  allSections.find((section) =>
    section.links.some((link) => isPathActive(pathname, link)),
  )?.id ?? null;

const SidebarLink = ({
  to,
  label,
  nested = false,
  isActive = false,
  onNavigate,
}) => (
  <Link
    to={to}
    onClick={onNavigate}
    aria-current={isActive ? "page" : undefined}
    className={`sidebar-link${nested ? " sidebar-link--nested" : ""}${
      isActive ? " sidebar-link--active" : ""
    }`}
  >
    <span>{label}</span>
  </Link>
);

const AccordionGroup = ({
  section,
  isOpen,
  onToggle,
  onLinkNavigate,
  pathname,
}) => (
  <section className="sidebar-section">
    <button
      type="button"
      className={`sidebar-section__toggle${
        isOpen ? " sidebar-section__toggle--open" : ""
      }`}
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls={`sidebar-group-${section.id}`}
    >
      <span>{section.title}</span>
      <span
        className={`sidebar-section__chevron${
          isOpen ? " sidebar-section__chevron--open" : ""
        }`}
        aria-hidden="true"
      >
        ›
      </span>
    </button>
    {isOpen && (
      <div
        className="sidebar-section__links"
        id={`sidebar-group-${section.id}`}
      >
        {section.links.map((link) => (
          <SidebarLink
            key={link.to}
            {...link}
            nested
            isActive={isPathActive(pathname, link)}
            onNavigate={() => onLinkNavigate(section.id)}
          />
        ))}
      </div>
    )}
  </section>
);

const Sidebar = () => {
  const { pathname } = useLocation();
  const { user } = useContext(AuthContext);
  const activeGroupId = getActiveGroupId(pathname);
  const [openGroups, setOpenGroups] = useState(() =>
    activeGroupId ? { [activeGroupId]: true } : {},
  );

  const isGroupOpen = (groupId) => {
    if (Object.hasOwn(openGroups, groupId)) {
      return openGroups[groupId];
    }

    return groupId === activeGroupId;
  };

  const toggleGroup = (groupId) => {
    setOpenGroups((current) => {
      const currentlyOpen = Object.hasOwn(current, groupId)
        ? current[groupId]
        : groupId === activeGroupId;

      return {
        ...current,
        [groupId]: !currentlyOpen,
      };
    });
  };

  const keepGroupOpen = (groupId) => {
    setOpenGroups((current) => ({
      ...current,
      ...(activeGroupId && !Object.hasOwn(current, activeGroupId)
        ? { [activeGroupId]: true }
        : {}),
      [groupId]: true,
    }));
  };

  return (
    <aside className="app-sidebar">
      <Link to="/" className="brand" aria-label="AssetFlow 홈">
        <span>
          <strong>AssetFlow</strong>
          <small>Asset Management</small>
        </span>
      </Link>

      {user && (
        <nav className="sidebar-nav" aria-label="주요 메뉴">
          <SidebarLink to="/" label="대시보드" isActive={pathname === "/"} />

          {(user.role === "ADMIN" || user.role === "MANAGER") && (
            <>
              <p className="sidebar-role-label">관리자 메뉴</p>
              {adminSections.map((section) => (
                <AccordionGroup
                  key={section.id}
                  section={section}
                  isOpen={isGroupOpen(section.id)}
                  onToggle={() => toggleGroup(section.id)}
                  onLinkNavigate={keepGroupOpen}
                  pathname={pathname}
                />
              ))}
            </>
          )}

          {user.role !== "ADMIN" && (
            <>
              <p className="sidebar-role-label sidebar-role-label--user">
                사용자 메뉴
              </p>
              {userSections.map((section) => (
                <AccordionGroup
                  key={section.id}
                  section={section}
                  isOpen={isGroupOpen(section.id)}
                  onToggle={() => toggleGroup(section.id)}
                  onLinkNavigate={keepGroupOpen}
                  pathname={pathname}
                />
              ))}
            </>
          )}
        </nav>
      )}
    </aside>
  );
};

export default Sidebar;
