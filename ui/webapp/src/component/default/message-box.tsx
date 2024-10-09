import { useEffect, useRef } from "react";
import { Button } from "antd";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import {
  useMessageLoader,
  type IMessage,
} from "../../states/message-box-state";
import { formatDiscordTime, trimId, WebsocketApi } from "../../utils/utils";
import { useAuth } from "../../states/auth";

export function MessageBox() {
  const messageSectionRef = useRef<HTMLDivElement>(null);
  const {
    loader,
    usersList,
    renderMessages,
    setRenderMessages,
    appendRenderMessages,
  } = useMessageLoader();
  const { auth } = useAuth();

  const Q_G_MESSAGE = gql`
    query LoadGroupMessages($recipient: String!) {
      getMessagesFor(recipient: $recipient, take: 500, skip: 0) {
        data {
          body
          meta {
            messageMetaType
            refId
            title
          }
          senderId
          type
          createdAt
        }
      }
    }
  `;

  const Q_U_MESSAGE = gql`
    query GetMessagesBetween($recipient: String!, $senderId: String!) {
      getMessagesBetween(
        recipient: $recipient
        senderId: $senderId
        take: 200
        skip: 0
      ) {
        data {
          body
          meta {
            messageMetaType
            refId
            title
          }
          senderId
          type
          recipient
          createdAt
        }
      }
    }
  `;

  const M_G_MESSAGE = gql`
    mutation SendMessageToAGroup(
      $messageBody: String!
      $sender: String!
      $recipient: String!
    ) {
      sendMessage(
        messageBody: $messageBody
        type: group
        recipent: $recipient
        sender: $sender
      ) {
        body
        meta {
          messageMetaType
          refId
          title
        }
        senderId
        type
        createdAt
      }
    }
  `;
  const [
    gMessageQuery,
    {
      data: groupMessaages,
      loading: lodingGroupMessages,
      error: errorGroupMessages,
    },
  ] = useLazyQuery(Q_G_MESSAGE, {
    fetchPolicy: "network-only",
  });

  const [
    uMessageQuery,
    {
      data: userMessaages,
      loading: lodingUserMessages,
      error: errorUserMessages,
    },
  ] = useLazyQuery(Q_U_MESSAGE, {
    fetchPolicy: "network-only",
  });

  const [
    mSendMessage,
    {
      data: sendMessageMut,
      loading: loadingMessageSend,
      error: errorMessageSend,
    },
  ] = useMutation(M_G_MESSAGE);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inputFeild = document.querySelector(
      ".messageBox-send",
    ) as HTMLInputElement;
    mSendMessage({
      variables: {
        messageBody: inputFeild?.value as string,
        sender: auth.username,
        recipient: loader.recipient,
      },
    });
  };

  const handleIncomingMessages = (newMessage: IMessage) => {
    appendRenderMessages(newMessage);
  };

  useEffect(() => {
    if (loader.messageType === "groups") {
      gMessageQuery({
        variables: {
          recipient: loader.recipient,
        },
      });
      // websocket conn for incoming connections
      const socket = new WebSocket(
        WebsocketApi.GroupJoin(loader.recipient, loader.senderId),
      );
      // Event listener for receiving messages
      socket.addEventListener("message", (event) => {
        const newMessage = JSON.parse(event.data) as IMessage;
        handleIncomingMessages(newMessage);
      });

      return () => {
        socket.close();
        console.log("WebSocket connection closed");
      };
    } else if (loader.messageType === "users") {
      uMessageQuery({
        variables: {
          recipient: loader.recipient,
          senderId: auth.id,
        },
      });
    }
  }, [loader]);

  useEffect(() => {
    if (sendMessageMut?.sendMessage) {
      const newMessage = sendMessageMut.sendMessage as IMessage;
      setRenderMessages([...renderMessages, newMessage]);
      const inputFeild = document.querySelector(
        ".messageBox-send",
      ) as HTMLInputElement;
      inputFeild.value = "";
    }
  }, [sendMessageMut]);

  useEffect(() => {
    if (groupMessaages?.getMessagesFor?.data) {
      const data = groupMessaages?.getMessagesFor?.data as IMessage[];
      setRenderMessages([...data].reverse());
    }
  }, [groupMessaages]);

  useEffect(() => {
    if (userMessaages?.getMessagesBetween?.data) {
      const data = userMessaages?.getMessagesBetween?.data as IMessage[];
      setRenderMessages([...data].reverse());
    }
  }, [userMessaages]);

  useEffect(() => {
    if (messageSectionRef.current) {
      messageSectionRef.current.scrollTop =
        messageSectionRef.current.scrollHeight;
    }
  }, [renderMessages]);

  if (loader.messageType === "none") {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center w-100 border m-auto rounded p-2"
        style={{ height: "80vh" }}
      >
        <h1 className="text-center h1 rainbow-text mt-5">
          Hello, {auth.username}
        </h1>

        <p className="h5 text-center w-50 mt-3">
          Privacy isn't a privilege; it's a fundamental right. Our messaging app
          puts you back in control—open-source, secure, and built for
          transparency.
        </p>

        <span
          className="text-muted text-center w-50 mt-2"
          style={{ fontSize: "0.7em" }}
        >
          Our open-source messaging app is designed with privacy as its core
          principle. Built on secure, transparent protocols, it ensures that
          your conversations remain truly private. With no hidden algorithms or
          closed systems, the app offers full control over your data while
          giving the global developer community the power to audit and improve
          its security. Whether you're chatting with friends or working on
          sensitive projects, our app guarantees end-to-end encryption and zero
          compromise on privacy. Stay connected, stay secure—because your
          privacy matters.
        </span>
      </div>
    );
  }

  return (
    <div className="w-100 d-flex flex-column">
      <div
        ref={messageSectionRef}
        className="container-fluid border rounded py-2"
        style={{ height: "80vh", overflow: "auto" }}
      >
        {renderMessages?.map((message) => (
          <div className="row my-2 d-flex justify-center align-item-center">
            <div className="col-10">
              <span
                style={{
                  fontWeight: "500",
                  fontSize:
                    message.meta?.messageMetaType === "user_joined"
                      ? "0.9em"
                      : "1em",
                }}
              >
                {usersList.get(message.senderId)?.username
                  ? `@${usersList.get(message.senderId)?.username}`
                  : `#${trimId(message.senderId)}`}
                :
              </span>
              <span
                className="mx-3"
                style={{
                  fontSize:
                    message.meta?.messageMetaType === "user_joined"
                      ? "0.9em"
                      : "1em",
                }}
              >
                {message.body}
              </span>
            </div>
            <div
              className="col-2 text-mute"
              style={{ fontSize: "0.7em", textAlign: "right" }}
            >
              {formatDiscordTime(new Date(message.createdAt))}
            </div>
          </div>
        ))}
      </div>

      <div className="container-fluid my-2 p-0" style={{ minHeight: "10vh" }}>
        <form onSubmit={handleSubmit}>
          <div className="input-group w-100">
            <input
              type="text"
              className="form-control messageBox-send"
              placeholder="Type your message..."
              name="inputField"
            />
            <Button htmlType="submit" size="large" loading={loadingMessageSend}>
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
