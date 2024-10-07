import { useEffect, useState } from "react";
import { AuthModal } from "./component/auth/auth";

import "./App.css";
import { useAuth } from "./states/auth";
import { Homepage } from "./pages/homepage";

function App() {
  const { auth } = useAuth();
  const [modalState, setModalState] = useState(false);

  useEffect(() => {
    setModalState(!auth.isLoggedIn);
  }, [auth]);

  return (
    <div className="w-100">
      <AuthModal
        modalState={modalState}
        changeModalState={(newState: boolean) => setModalState(newState)}
      />
      <Homepage />
    </div>
  );
}

export default App;
