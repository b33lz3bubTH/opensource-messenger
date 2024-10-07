import { useEffect, useState } from "react";
import { AuthModal } from "./component/auth/auth";

import "./App.css";
import { useAuth } from "./states/auth";

function App() {
  const { auth } = useAuth();
  const [modalState, setModalState] = useState(false);
  useEffect(() => {
    setModalState(!auth.isLoggedIn);
  }, [auth]);
  return (
    <AuthModal
      modalState={modalState}
      changeModalState={(newState: boolean) => setModalState(newState)}
    />
  );
}

export default App;
