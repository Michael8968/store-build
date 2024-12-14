import React from 'react'
import ReactDOM from 'react-dom/client'
// import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import App from './App'
import './index.css'

// 创建 Apollo Client 实例
// const client = new ApolloClient({
// //   const  vendureUiConfig = await fetch('./vendure-ui-config.json').then(res => res.json());
//   uri: 'http://localhost:3000/admin-api', // 替换为您的 GraphQL API 地址
//   cache: new InMemoryCache()
// });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <App />
  </React.StrictMode>
)
