import { useEffect, useState } from "react";
import { gql, useLazyQuery } from "@apollo/client";
import { Menu, Avatar } from "antd";
import { useAuth } from "../../states/auth";
import { wordWrap } from "../../utils/utils";
import { Loader } from "./loader";

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
      setFList(friendListData.getConnectedUsers as IUser[]);
    }
  }, [friendListData]);

  useEffect(() => {
    if (groupListData?.getGroups) {
      setGList(groupListData?.getGroups as IGroup[]);
    }
  }, [groupListData]);

  return (
    <div className="w-100" style={{ minHeight: "45vh" }}>
      <p className="h4 border-bottom text-center">Friends and Groups</p>
      {(loadingFLD || loadingGLD) && <Loader />}
      <Menu
        mode="inline"
        style={{ minHeight: "45vh", overflow: "auto" }}
        onClick={(e) => console.log(e)}
      >
        {/* Friends Submenu */}
        <Menu.SubMenu key="friends" title="Friends">
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
