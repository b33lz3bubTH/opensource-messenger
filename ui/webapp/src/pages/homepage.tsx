import { Navbar } from "../component/default/navbar";
import { FriendsAndGroupsList } from "../component/default/load-friends";
import { useAuth } from "../states/auth";

export function Homepage() {
  const { auth } = useAuth();
  return (
    <div className="w-100">
      <Navbar />
      {auth.isLoggedIn && (
        <div className="container-fluid">
          <p className="initialism text-center">
            Welcome <mark>{auth.username}</mark>, your <mark>{auth.email}</mark>
            .
          </p>

          <div className="row">
            <div className="col-md-3">
              <FriendsAndGroupsList />
            </div>
            <div className="col-md-9"></div>
          </div>
        </div>
      )}
    </div>
  );
}
