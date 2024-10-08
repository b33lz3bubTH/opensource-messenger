import { useEffect, useState } from "react";
import { gql, useLazyQuery } from "@apollo/client";
import { Menu, Avatar } from "antd";
import { useAuth } from "../../states/auth";
import { wordWrap } from "../../utils/utils";
import { Loader } from "./loader";
import {
  useMessageLoader,
  type messsageType,
} from "../../states/message-box-state";

interface IUser {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  username: string;
}

interface IGroup {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
}

export function FriendsAndGroupsList() {
  const { auth } = useAuth();
  const { setUserList, loadMessage } = useMessageLoader();
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

  const [
    fListQuery,
    { data: friendListData, loading: loadingFLD, error: errorFLD },
  ] = useLazyQuery(Q_FLIST_FETCH);

  const [
    gListQuery,
    { data: groupListData, loading: loadingGLD, error: errorGLD },
  ] = useLazyQuery(Q_GLIST_FETCH);

  const [userFList, setFList] = useState<Array<IUser>>([]);
  const [groupList, setGList] = useState<Array<IGroup>>([]);

  useEffect(() => {
    fListQuery({
      variables: {
        userId: auth.id,
      },
    });
    gListQuery({
      variables: {
        username: auth.username,
      },
    });
  }, []);

  useEffect(() => {
    if (friendListData?.getConnectedUsers) {
      const data = friendListData?.getConnectedUsers as IUser[];

      const userMapper: Map<string, { username: string; email: string }> =
        new Map();
      for (const user of data) {
        userMapper.set(user.id, { username: user.username, email: user.email });
      }
      userMapper.set(auth.id, { username: auth.username, email: auth.email });
      setUserList(userMapper);
      setFList(data);
    }
  }, [friendListData]);

  useEffect(() => {
    if (groupListData?.getGroups) {
      setGList(groupListData?.getGroups as IGroup[]);
    }
  }, [groupListData]);

  return (
    <div className="w-100" style={{ minHeight: "45vh" }}>
      <p className="h4 border-bottom text-center p-2">Friends and Groups</p>
      {(loadingFLD || loadingGLD) && <Loader />}
      <Menu
        className="my-2"
        mode="inline"
        style={{ minHeight: "45vh", overflow: "auto" }}
        onClick={(e) => {
          console.log(e.keyPath);
          const [recipient, typeOfClick] = e.keyPath;
          loadMessage({
            messageType: typeOfClick as messsageType,
            recipient,
            senderId: auth.id,
          });
        }}
      >
        {/* Friends Submenu */}
        <Menu.SubMenu key="users" title="Friends">
          {userFList
            .map((user) => {
              return {
                key: user.id,
                icon: (
                  <Avatar
                    style={{ backgroundColor: "#1677ff", color: "white" }}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>
                ),
                label: wordWrap(`${user.username} #${user.id}`, 20),
              };
            })
            .map((item) => (
              <Menu.Item key={item.key} icon={item.icon}>
                {item.label}
              </Menu.Item>
            ))}
        </Menu.SubMenu>

        {/* Groups Submenu */}
        <Menu.SubMenu key="groups" title="Groups">
          {groupList
            .map((group) => {
              return {
                key: group.id,
                icon: (
                  <Avatar
                    style={{ backgroundColor: "#f56a00", color: "white" }}
                  >
                    {group.name.charAt(0).toUpperCase()}
                  </Avatar>
                ),
                label: wordWrap(`${group.name}`, 30),
              };
            })
            .map((item) => (
              <Menu.Item key={item.key} icon={item.icon}>
                {item.label}
              </Menu.Item>
            ))}
        </Menu.SubMenu>
      </Menu>
    </div>
  );
}
