import Header from "./Header";
import Sidebar from "./Sidebar";

const AppLayout = ({ children }) => {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Header />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
