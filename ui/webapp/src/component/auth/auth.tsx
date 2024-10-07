import { Modal, Button, Form, Input, Checkbox } from "antd";
import { gql, useLazyQuery } from "@apollo/client";
import { useEffect } from "react";

import { IAuth, useAuth } from "../../states/auth";

type FieldType = {
  username?: string;
  password?: string;
  remember?: boolean;
};

export function AuthModal({
  modalState,
  changeModalState,
}: {
  modalState: boolean;
  changeModalState: (newState: boolean) => void;
}) {
  const { login } = useAuth();
  const Q_LOGIN_GQL = gql`
    query SignIn($pass: String!, $username: String!) {
      signIn(password: $pass, username: $username) {
        email
        id
        username
        createdAt
      }
    }
  `;

  // useLazyQuery to trigger the query only when the form is submitted
  const [loginQuery, { data: loginData, loading, error }] =
    useLazyQuery(Q_LOGIN_GQL);

  const handleLogin = async (values: FieldType) => {
    loginQuery({
      variables: {
        pass: values.password,
        username: values.username,
      },
    });
  };

  useEffect(() => {
    console.log(`loginData: `, loginData);
    if (loginData?.signIn?.id) {
      login(loginData?.signIn as IAuth);
    }
  }, [loginData]);

  return (
    <Modal
      title="Welcome To Open Messenger."
      open={modalState}
      onCancel={() => changeModalState(false)}
      footer={
        <Button
          type="primary"
          form="authForm"
          key="submit"
          htmlType="submit"
          loading={loading}
        >
          Submit
        </Button>
      }
    >
      <Form
        id="authForm"
        name="basic"
        className="my-5"
        initialValues={{ remember: true }}
        onFinish={handleLogin}
        onFinishFailed={(a) => console.log("Failed:", a)}
        autoComplete="off"
      >
        <Form.Item<FieldType>
          label="Username"
          name="username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<FieldType>
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item<FieldType> name="remember" valuePropName="checked">
          <Checkbox>Remember me</Checkbox>
        </Form.Item>
      </Form>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {loginData && <p>Welcome {loginData.signIn.username}!</p>}
    </Modal>
  );
}
