import { create } from "zustand";

export interface IUser {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  username: string;
}

export interface IGroup {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
}


interface FriendsAndGroupsState {
  friends: IUser[];
  groups: IGroup[];
  setFriends: (friends: IUser[]) => void;
  setGroups: (groups: IGroup[]) => void;
  resetFriendsAndGroups: () => void;
}

export const useFriendsAndGroupsStore = create<FriendsAndGroupsState>((set) => ({
  friends: [],
  groups: [],
  setFriends: (friends: IUser[]) => set({ friends }),
  setGroups: (groups: IGroup[]) => set({ groups }),
  resetFriendsAndGroups: () => set({ friends: [], groups: [] }),
}));
