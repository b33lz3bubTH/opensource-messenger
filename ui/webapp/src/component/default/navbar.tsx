import { useAuth } from "../../states/auth";

export function Navbar() {
  const { auth } = useAuth();
  return (
    <div className="container my-2">
      <nav className="navbar navbar-expand-lg navbar-light bg-light px-2 py-1 rounded-5">
        <a className="navbar-brand mx-4" href="#">
          Open Messenger
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarTogglerDemo02"
          aria-controls="navbarTogglerDemo02"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarTogglerDemo02">
          <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
            <li className="nav-item active">
              <a className="nav-link" href="#">
                Home
              </a>
            </li>
            <li className="nav-item">
              <div className="nav-link">
                {auth.isLoggedIn ? (
                  <span>Logout ({auth.username})</span>
                ) : (
                  <span>Login</span>
                )}
              </div>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}
