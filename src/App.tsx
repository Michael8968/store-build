import React from 'react'
import { useMutation, gql } from '@apollo/client'
import './App.css'

// 定义登录 mutation
const CURRENT_USER_FRAGMENT = gql`
    fragment CurrentUser on CurrentUser {
        id
        identifier
        channels {
            id
            code
            token
            permissions
        }
    }
`;
const ERROR_RESULT_FRAGMENT = gql`
    fragment ErrorResult on ErrorResult {
        errorCode
        message
    }
`;
const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!, $rememberMe: Boolean) {
    login(username: $username, password: $password, rememberMe: $rememberMe) {
        ...CurrentUser
        ...ErrorResult
    }
  }
  ${CURRENT_USER_FRAGMENT}
  ${ERROR_RESULT_FRAGMENT}
`

interface UserInfo {
    id: string;
    identifier: string;
    channels: {
        id: string;
        code: string;
        token: string;
        permissions: string[];
    }[];
    }

function App() {
  const [userInfo, setUserInfo] = React.useState<UserInfo>();
  // 使用 Apollo useMutation hook
  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      console.log('登录成功:', data);
      // 可以在这里处理登录成功后的逻辑
      // 例如：保存 token 到 localStorage
      localStorage.setItem('token', data.login.token);
      setUserInfo(data.login);
    },
    onError: (error) => {
      console.error('登录失败:', error.message);
    }
  });

  const handleLogin = async () => {
    try {
      await login({
        variables: {
          username: "superadmin", // 这里替换为实际的用户名
          password: "superadmin", // 这里替换为实际的密码
          rememberMe: true
        }
      });
    } catch (error) {
      console.error('登录请求出错:', error);
    }
  }

  return (
    <>
      <div>
        <button 
          onClick={handleLogin}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? '登录中...' : '登录'}
        </button>
        {userInfo && <div>
            <p>登录结果</p>
            <p> {`id: ${userInfo?.id}`}</p>
            <p> {`identifier: ${userInfo?.identifier}`}</p>
        </div>}
      </div>
    </>
  )
}

export default App
