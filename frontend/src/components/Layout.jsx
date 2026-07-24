import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, Users } from "lucide-react";

function Layout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">L</div>

          <div>
            <h2>LeadFlow</h2>
            <span>Sales Workspace</span>
          </div>
        </div>

        <nav>
          <NavLink to="/dashboard">
            <LayoutDashboard size={19} />
            Dashboard
          </NavLink>

          <NavLink to="/leads">
            <Users size={19} />
            Leads
          </NavLink>
        </nav>

        <button className="logout-button" onClick={logout}>
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <div className="main-area">
        <main className="content">
          <Outlet />
        </main>

        <footer>
          <a
            href="https://digitalheroes.co"
            target="_blank"
            rel="noreferrer"
          >
            Built for Digital Heroes Training Task
          </a>
        </footer>
      </div>
    </div>
  );
}

export default Layout;