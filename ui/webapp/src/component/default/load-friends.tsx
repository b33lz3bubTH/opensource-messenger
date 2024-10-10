// components/FriendsAndGroupsList.tsx
import { Menu, Avatar } from "antd";
import { useFetchFriendsAndGroups } from "../../hooks/contacts-list";
import { useFriendsAndGroupsStore } from "../../states/contacts-list.state";
import { useAuth } from '../../states/auth';
import { wordWrap, trimId } from "../../utils/utils";
import { Loader } from "./loader";
import { useMessageLoader, type messsageType } from "../../states/message-box-state";

export function FriendsAndGroupsList() {
  const { auth } = useAuth()
  const { friends, groups } = useFriendsAndGroupsStore();
  const { loadMessage } = useMessageLoader();
  const { loading } = useFetchFriendsAndGroups();

  return (
    <div className="w-100" style={{ minHeight: "45vh" }}>
      <p className="h4 border-bottom text-center p-2">Friends and Groups</p>
      {loading && <Loader />}
      <Menu
        className="my-2"
        mode="inline"
        style={{ minHeight: "45vh", overflow: "auto" }}
        onClick={(e) => {
          const [recipient, typeOfClick] = e.keyPath;
          loadMessage({
            messageType: typeOfClick as messsageType,
            recipient,
            senderId: auth.id,
          });
        }}
      >
        {/* Friends Submenu */}
        <Menu.SubMenu key="users" title="Know Users" style={{maxHeight: '50vh', overflow: 'auto'}}>
          {friends.map((user) => (
            <Menu.Item
              key={user.id}
              icon={
                <Avatar style={{ backgroundColor: "#1677ff", color: "white" }}>
                  {user.username.charAt(0).toUpperCase()}
                </Avatar>
              }
            >
              {wordWrap(`${user.username} #${trimId(user.id)}`, 20)}
            </Menu.Item>
          ))}
        </Menu.SubMenu>

        {/* Groups Submenu */}
        <Menu.SubMenu key="groups" title="Groups">
          {groups.map((group) => (
            <Menu.Item
              key={group.id}
              icon={
                <Avatar style={{ backgroundColor: "#f56a00", color: "white" }}>
                  {group.name.charAt(0).toUpperCase()}
                </Avatar>
              }
            >
              {wordWrap(group.name, 30)}
            </Menu.Item>
          ))}
        </Menu.SubMenu>
      </Menu>
    </div>
  );
}
