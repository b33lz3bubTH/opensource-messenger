import { Navbar } from "../component/default/navbar";
import { FriendsAndGroupsList } from "../component/default/load-friends";
import { useAuth } from "../states/auth";
import { MessageBox } from "../component/default/message-box";

export function Homepage() {
  const { auth } = useAuth();
  return (
    <div className="w-100">
      <Navbar />
      {auth.isLoggedIn && (
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-3">
              <FriendsAndGroupsList />
            </div>
            <div className="col-md-9 my-5">
              <MessageBox />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
