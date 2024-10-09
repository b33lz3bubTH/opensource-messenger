import { create } from "zustand";

export type messsageType = "users" | "groups" | "none";

export interface IMessage {
  body: string;
  meta?: {
    messageMetaType: string;
    refId: string;
    title: string;
  };
  senderId: string;
  type: string;
  recipient: string;
  createdAt: Date;
}

const messageLoaderInit = {
  messageType: "none" as messsageType,
  senderId: "",
  recipient: "",
};

interface IUser {
  username: string;
  email: string;
}

export type IMessageLoader = typeof messageLoaderInit;

interface MessageState {
  loader: IMessageLoader;
  loadMessage: (data: IMessageLoader) => void;
  setUserList: (data: Map<string, IUser>) => void;
  usersList: Map<string, IUser>;
  renderMessages: IMessage[];
  setRenderMessages: (data: IMessage[]) => void;
  appendRenderMessages: (data: IMessage) => void;
}

export const useMessageLoader = create<MessageState>((set) => ({
  loader: messageLoaderInit,
  usersList: new Map<string, IUser>(),
  renderMessages: [],
  appendRenderMessages: (data: IMessage) =>
    set((state) => {
      return { ...state, renderMessages: [...state.renderMessages, data] };
    }),
  setRenderMessages: (data: IMessage[]) =>
    set((state) => ({ ...state, renderMessages: data })),
  setUserList: (data: Map<string, IUser>) =>
    set((state) => ({ ...state, usersList: data })),
  loadMessage: (data: IMessageLoader) =>
    set((state) => ({ ...state, loader: { ...data } })),
}));
