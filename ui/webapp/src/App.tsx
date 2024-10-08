import { useEffect, useState } from "react";
import { notification } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import { AuthModal } from "./component/auth/auth";

import "./App.css";
import { useAuth } from "./states/auth";
import { Homepage } from "./pages/homepage";
import { WebsocketApi, trimId, wordWrap } from "./utils/utils";
import { IMessage, useMessageLoader } from "./states/message-box-state";

function App() {
  const [api, contextHolder] = notification.useNotification();
  const { auth } = useAuth();
  const { usersList } = useMessageLoader();
  const [modalState, setModalState] = useState(false);

  useEffect(() => {
    if (auth.isLoggedIn) {
      setModalState(!auth.isLoggedIn);
      // websocket connection for dm's
    }
  }, [auth]);

  useEffect(() => {
    setModalState(true);
  }, []);

  useEffect(() => {
    const socket = new WebSocket(WebsocketApi.DmListner(auth.id));
    // Event listener for receiving messages
    socket.addEventListener("message", (event) => {
      const notification = JSON.parse(event.data) as IMessage;
      const whoSoEverSending = usersList.get(notification.senderId);
      api.info({
        message: `By - ${whoSoEverSending?.username ?? trimId(notification.senderId)}`,
        description: wordWrap(notification.body, 70),
        icon: <MessageOutlined style={{ color: "#108ee9" }} />,
        duration: 5,
        showProgress: true,
      });
    });

    return () => {
      socket.close();
      console.log("WebSocket connection closed");
    };
  }, [usersList]);

  return (
    <div className="w-100">
      {contextHolder}
      <AuthModal
        modalState={modalState}
        changeModalState={(newState: boolean) => setModalState(newState)}
      />
      <Homepage />
    </div>
  );
}

export default App;
