import { useMutation, gql } from '@apollo/client'
import './App.css'

// 定义登录 mutation
const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        id
        username
        # 其他需要的用户字段...
      }
    }
  }
`

function App() {
  // 使用 Apollo useMutation hook
  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      console.log('登录成功:', data);
      // 可以在这里处理登录成功后的逻辑
      // 例如：保存 token 到 localStorage
      localStorage.setItem('token', data.login.token);
    },
    onError: (error) => {
      console.error('登录失败:', error.message);
    }
  });

  const handleLogin = async () => {
    try {
      await login({
        variables: {
          username: "your_username", // 这里替换为实际的用户名
          password: "your_password"  // 这里替换为实际的密码
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
      </div>
    </>
  )
}

export default App
