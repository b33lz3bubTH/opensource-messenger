import { useEffect, useState } from "react";
import { notification } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import { AuthModal } from "./component/auth/auth";

import "./App.css";
import { useAuth } from "./states/auth";
import { Homepage } from "./pages/homepage";
import { WebsocketApi, trimId, wordWrap } from "./utils/utils";
import { IMessage, useMessageLoader } from "./states/message-box-state";
import { useFetchFriendsAndGroups } from './hooks/contacts-list';

function App() {
  const [api, contextHolder] = notification.useNotification();
  const { refreshData } = useFetchFriendsAndGroups();
  const { auth } = useAuth();
  const { usersList, loader, appendRenderMessages } = useMessageLoader();
  
  const [modalState, setModalState] = useState(false);
  const [socket, setSocket] = useState<WebSocket | undefined>(undefined);

  useEffect(() => {
    if (auth.isLoggedIn) {
      setModalState(!auth.isLoggedIn);
    }
  }, [auth]);

  useEffect(() => {
    setModalState(true);
  }, []);

  // Consolidated WebSocket connection setup and message handling
  useEffect(() => {
    if (!auth.id) return; // Ensure we have an auth ID before opening the WebSocket

    // Function to initialize the WebSocket connection
    const initWebSocket = () => {
      const newSocket = new WebSocket(WebsocketApi.DmListner(auth.id));
      setSocket(newSocket); // Save the new socket to state
      
      // Event listener for receiving messages
      newSocket.addEventListener("message", (event) => {
        const notification = JSON.parse(event.data) as IMessage;
        let whoSoEverSending = usersList.get(notification.senderId);

        if (!whoSoEverSending && notification.type === "direct") {
          console.log(`idk who is sending?`, whoSoEverSending);
          refreshData(); // Refresh data if user isn't found
        }

        if (loader.messageType === "users" && loader.recipient === notification.senderId) {
          console.log(`appending ....`);
          appendRenderMessages(notification);
          return;
        }

        api.info({
          message: `By - ${whoSoEverSending?.username ?? trimId(notification.senderId)}`,
          description: wordWrap(notification.body, 70),
          icon: <MessageOutlined style={{ color: "#108ee9" }} />,
          duration: 5,
          showProgress: true,
        });
      });

      // Event listener for WebSocket close
      newSocket.addEventListener("close", () => {
        console.log("WebSocket connection closed");
        setSocket(undefined); // Reset the socket on close
      });

      return newSocket;
    };

    // Initialize the WebSocket connection
    const ws = initWebSocket();

    // Cleanup function to close the WebSocket when dependencies change or component unmounts
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
        console.log("Cleanup: WebSocket connection closed");
      }
    };
  }, [auth.id, usersList, refreshData, loader]);

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
