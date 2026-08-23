import { useEffect, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

const AppLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isSidebarOpen) {
      return undefined;
    }

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isSidebarOpen]);

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="app-shell">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <button
        type="button"
        className={`sidebar-overlay${
          isSidebarOpen ? " sidebar-overlay--visible" : ""
        }`}
        aria-label="메뉴 닫기"
        onClick={closeSidebar}
      />
      <div className="app-main">
        <Header
          isMenuOpen={isSidebarOpen}
          onMenuToggle={() => setIsSidebarOpen((current) => !current)}
        />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
