// hooks/useFetchFriendsAndGroups.ts
import { useEffect, useCallback } from "react";
import { gql, useLazyQuery } from "@apollo/client";
import { useAuth } from "../states/auth";
import { useFriendsAndGroupsStore, IUser } from "../states/contacts-list.state";
import { useMessageLoader } from "../states/message-box-state";

const Q_FLIST_FETCH = gql`
  query GetUsersFriendList($userId: String!) {
    getConnectedUsers(userId: $userId) {
      email
      id
      createdAt
      updatedAt
      username
    }
  }
`;

const Q_GLIST_FETCH = gql`
  query GetAllGroupsOfAnUser($username: String!) {
    getGroups(username: $username) {
      name
      id
      createdAt
      description
    }
  }
`;

export function useFetchFriendsAndGroups() {
  const { auth } = useAuth();
  const { setUserList } = useMessageLoader();
  const setFriends = useFriendsAndGroupsStore((state) => state.setFriends);
  const setGroups = useFriendsAndGroupsStore((state) => state.setGroups);

  const [fetchFriends, { data: friendListData, loading: loadingFLD }] =
    useLazyQuery(Q_FLIST_FETCH, { fetchPolicy: "network-only" });
  const [fetchGroups, { data: groupListData, loading: loadingGLD }] =
    useLazyQuery(Q_GLIST_FETCH, { fetchPolicy: "network-only" });

  useEffect(() => {
    if (auth?.id) {
      fetchFriends({ variables: { userId: auth.id } });
    }

    if (auth?.username) {
      fetchGroups({ variables: { username: auth.username } });
    }
  }, [auth, fetchFriends, fetchGroups]);

  useEffect(() => {
    if (friendListData?.getConnectedUsers) {
      const friendsList = friendListData.getConnectedUsers as IUser[];
      const usersList = new Map<string, IUser>();

      for (const user of friendsList) {
        usersList.set(user.id, user);
      }
      const currentUser: any = { ...auth };
      delete currentUser.isLoggedIn;
      usersList.set(auth.id, currentUser as IUser);
      setFriends(friendsList);
      setUserList(usersList);
    }
  }, [friendListData, setFriends]);

  useEffect(() => {
    if (groupListData?.getGroups) {
      setGroups(groupListData.getGroups);
    }
  }, [groupListData, setGroups]);

  const refreshData = useCallback(() => {
    if (!auth.username) {
      console.log(`not logged in,`, auth);
      return;
    }
    console.log(`refreshing....`);
    fetchFriends({ variables: { userId: auth.id } });

    fetchGroups({ variables: { username: auth.username } });
  }, [auth, fetchFriends, fetchGroups]);

  return {
    loading: loadingFLD || loadingGLD,
    refreshData,
  };
}
