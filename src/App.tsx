import React from 'react'
import { gql, useQuery, useMutation, NormalizedCacheObject } from '@apollo/client';
import './App.css'
import { ApolloClient, InMemoryCache, ApolloLink, createHttpLink, ApolloProvider } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const PRODUCT_LIST_QUERY_PRODUCT_FRAGMENT = gql`
    fragment ProductListQueryProductFragment on Product {
        id
        createdAt
        updatedAt
        enabled
        languageCode
        name
        slug
        featuredAsset {
            id
            createdAt
            updatedAt
            preview
            focalPoint {
                x
                y
            }
        }
        variantList {
            totalItems
        }
    }
`;

const PRODUCT_LIST_QUERY = gql`
    query ProductListQuery($options: ProductListOptions) {
        products(options: $options) {
            items {
                ...ProductListQueryProductFragment
            }
            totalItems
        }
    }
    ${PRODUCT_LIST_QUERY_PRODUCT_FRAGMENT}
`;

type Scalars = {
    ID: { input: string; output: string; }
    String: { input: string; output: string; }
    Boolean: { input: boolean; output: boolean; }
    Int: { input: number; output: number; }
    Float: { input: number; output: number; }
};
interface Product {
    __typename?: 'Product'
    description: Scalars['String']['output'];
    enabled: Scalars['Boolean']['output'];
    id: Scalars['ID']['output'];
    name: Scalars['String']['output'];
};

// Update login fragments
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

// Update login mutation
const LOGIN_MUTATION = gql`
  mutation AttemptLogin($username: String!, $password: String!, $rememberMe: Boolean!) {
    login(username: $username, password: $password, rememberMe: $rememberMe) {
      ...CurrentUser
      ...ErrorResult
    }
  }
  ${CURRENT_USER_FRAGMENT}
  ${ERROR_RESULT_FRAGMENT}
`;

export function createApolloClient (authToken: string, activeChannelToken: string, apiEndpoint: string) {
    // 创建缓存
    const cache = new InMemoryCache({
        typePolicies: {
            // 可以根据需要配置类型策略
            Query: {
                fields: {
                    // 字段配置
                }
            }
        }
    });

    // 创建 HTTP 链接
    const httpLink = createHttpLink({
        uri: apiEndpoint // GraphQL API 地址
    });

    // 创建认证链接
    const authLink = setContext((_, { headers }) => {
        return {
            headers: {
                ...headers,
                authorization: authToken ? `Bearer ${authToken}` : '',
                'Apollo-Require-Preflight': 'true',
                'vendure-token': activeChannelToken
            }
            // const channelToken = localStorageService.get('activeChannelToken');
            //     if (channelToken) {
            //         headers[channelTokenKey ?? 'vendure-token'] = channelToken;
            //     }
        };
    });

    // 创建 Apollo Client
    const client = new ApolloClient({
        link: ApolloLink.from([
            authLink,
            httpLink
        ]),
        cache,
        defaultOptions: {
            watchQuery: {
                fetchPolicy: 'cache-and-network'
            }
        }
    });

    return client;
}

interface ProductListContentProps {
    productList: Product[];
    onFetchProducts: (productList: Product[]) => void;
}

function ProductListContent({ productList, onFetchProducts }: ProductListContentProps) {
    // const [productList, setProductList] = React.useState<Product[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const { data, loading: queryLoading, error: queryError, refetch } = useQuery(PRODUCT_LIST_QUERY, {
        variables: {
            options: {
                skip: 0,
                take: 10,
                filter: {},
                filterOperator: "AND",
                sort: {
                    createdAt: "DESC"
                }
            }
        },
        skip: true
    });

    // Update login mutation
    // const [loginMutation] = useMutation(LOGIN_MUTATION, {
    //     onCompleted: (data) => {
    //         if (data.login?.channels?.[0]?.token) {
    //             const token = data.login.channels[0].token;
    //             localStorage.setItem('vnd__authToken', token);
    //             // Notify opener about successful login
    //             window.opener?.postMessage({
    //                 type: 'loginSuccess',
    //                 token: token,
    //                 user: {
    //                     id: data.login.id,
    //                     identifier: data.login.identifier,
    //                     permissions: data.login.channels[0].permissions
    //                 }
    //             }, '*');
    //             // Refresh product query
    //             refetch();
    //         }
    //     },
    //     onError: (error) => {
    //         setError(error.message);
    //     }
    // });

    // const login = async (username: string, password: string) => {
    //     try {
    //         setLoading(true);
    //         setError(null);
    //         await loginMutation({
    //             variables: {
    //                 username,
    //                 password,
    //                 rememberMe: false // 添加 rememberMe 参数
    //             }
    //         });
    //     } catch (err) {
    //         console.error('Login error:', err);
    //         if (err instanceof Error) {
    //             setError(err.message);
    //         } else {
    //             setError('Login failed');
    //         }
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // const onMessage = (event: MessageEvent) => {
    //     // ignore message from self
    //     if (event.source === window) {
    //         return;
    //     }
    //     console.log('message from opener', event?.data);

    //     if (event.data.type === 'authToken') {
    //         const authToken = event.data.token.replace(/^"|"$/g, '');
    //         const activeChannelToken = event.data.appConfig.activeChannelToken?.replace(/^"|"$/g, '');
    //         localStorage.setItem('vnd__authToken', authToken);
    //         localStorage.setItem('vnd__activeChannelToken', activeChannelToken);
    //         const appConfig = event.data.appConfig;
    //         const apiEndpoint = appConfig.apiEndpoint;

    //         // Update the client state
    //         setClient(createApolloClient(authToken, activeChannelToken, apiEndpoint));
    //     }

    //     if (event.data.type === 'login') {
    //         // Handle login request from opener
    //         login(event.data.username, event.data.password);
    //     }

    //     if (event.data.type === 'productList') {
    //         setProductList(event.data.productList?.items || []);
    //     }
    // }

    // // 添加获取产品列表的处理函数
    const handleGetProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('vnd__authToken');

            if (!token) {
                setError('No authentication token found. Please login first.');
                return;
            }

            const result = await refetch();
            if (result.data?.products?.items) {
                // setProductList(result.data.products.items);
                onFetchProducts(result.data.products.items);
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to fetch products');
            }
        } finally {
            setLoading(false);
        }
    };

    // Update product list when data changes
    React.useEffect(() => {
        if (data?.products?.items) {
            // setProductList(data.products.items);
            onFetchProducts(data.products.items);
        }
        setLoading(queryLoading);
        if (queryError) {
            setError(queryError.message);
        }
    }, [data, queryLoading, queryError]);

    const handleGetProducts2 = async () => {
        // send message to opener
        window.opener?.postMessage({
            type: 'getProductList',
        }, '*');
    }

    return (
        <div>
            <h2>Product List</h2>

            {/* Add Get Products button */}
            <button
                onClick={handleGetProducts}
                disabled={loading || !localStorage.getItem('vnd__authToken')}
            >
                {loading ? 'Loading...' : 'Get Products'}
            </button>

            {error && (
                <p style={{ color: 'red' }}>Error: {error}</p>
            )}

            {productList.length > 0 && (
                <ul>
                    {productList.map(product => (
                        <li key={product.id}>
                            <p>Name: {product.name}</p>
                            <p>ID: {product.id}</p>
                            <p>Enabled: {product.enabled ? 'Yes' : 'No'}</p>
                            {product.featuredAsset && (
                                <img
                                    src={product.featuredAsset.preview}
                                    alt={product.name}
                                    style={{ maxWidth: '100px' }}
                                />
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {productList.length === 0 && !loading && !error && (
                    <p>No products to display. Click the button to load products.</p>
                )}
        </div>
    );
}

function App () {
    const [client, setClient] = React.useState<ApolloClient<NormalizedCacheObject> | null>(null);
    const [productList, setProductList] = React.useState<Product[]>([]);

    React.useEffect(() => {
        // send message to opener
        window.opener?.postMessage({
            type: 'ready',
        }, '*');

        // listen message from opener
        window.addEventListener('message', onMessage);
        return () => {
            window.removeEventListener('message', onMessage);
        }
    }, []);

    const onMessage = (event: MessageEvent) => {
        // ignore message from self
        if (event.source === window) {
            return;
        }
        console.log('message from opener', event?.data);

        if (event.data.type === 'authToken') {
            const authToken = event.data.token.replace(/^"|"$/g, '');
            const activeChannelToken = event.data.appConfig.activeChannelToken?.replace(/^"|"$/g, '');
            localStorage.setItem('vnd__authToken', authToken);
            localStorage.setItem('vnd__activeChannelToken', activeChannelToken);
            const appConfig = event.data.appConfig;
            const apiEndpoint = appConfig.apiHost + ':' + appConfig.apiPort + '/' + appConfig.adminApiPath;

            // Update the client state
            setClient(createApolloClient(authToken, activeChannelToken, apiEndpoint));
        }

        if (event.data.type === 'login') {
            // Handle login request from opener
            // login(event.data.username, event.data.password);
        }

        if (event.data.type === 'productList') {
            setProductList(event.data.productList?.items || []);
        }
    }

    // Only render the Apollo-dependent content when client is available
    if (!client) {
        return <div>Waiting for configuration...</div>;
    }

    return (
        <ApolloProvider client={client}>
            <ProductListContent productList={productList} onFetchProducts={setProductList} />
        </ApolloProvider>
    );
}

export default App
