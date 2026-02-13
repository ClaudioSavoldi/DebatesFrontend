import { NavLink, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const linkClass = ({ isActive }) => `nav-link ${isActive ? "active" : ""}`;

  return (
    <nav className="navbar navbar-expand-lg dp-navbar sticky-top">
      <div className="container py-1">
        <Link className="navbar-brand" to="/">
          DebateHub
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          {/* LEFT */}
          <ul className="navbar-nav me-auto mt-2 mt-lg-0">
            <li className="nav-item">
              <NavLink to="/" className={linkClass} end>
                Topic
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/public/matches" className={linkClass}>
                Match pubblici
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/results" className={linkClass}>
                Risultati
              </NavLink>
            </li>

            {user && (
              <li className="nav-item">
                <NavLink to="/dashboard" className={linkClass}>
                  Dashboard
                </NavLink>
              </li>
            )}

            {user?.roles?.includes("Moderator") && (
              <li className="nav-item">
                <NavLink to="/mod" className={linkClass}>
                  Moderation
                </NavLink>
              </li>
            )}
          </ul>

          {/* RIGHT */}
          <div className="d-flex align-items-center gap-2 mt-2 mt-lg-0">
            {!user ? (
              <>
                <NavLink to="/login" className="btn btn-sm dp-navbtn dp-navbtn-outline">
                  Login
                </NavLink>
                <NavLink to="/register" className="btn btn-sm dp-navbtn dp-navbtn-primary">
                  Register
                </NavLink>
              </>
            ) : (
              <>
                <div className="dp-user d-none d-sm-inline-flex">
                  <span className="dp-user-label">Ciao</span>
                  <span className="dp-user-name">{user.username}</span>
                </div>

                <button type="button" className="btn btn-sm dp-logout" onClick={handleLogout}>
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
