# 🥞 Pancake Frontend

<p align="center">
  <a href="https://pancakeswap.finance">
      <img src="https://pancakeswap.finance/logo.png" height="128">
  </a>
</p>

This project contains the main features of the pancake application.

If you want to contribute, please refer to the [contributing guidelines](./CONTRIBUTING.md) of this project.

## Documentation

- [Info](doc/Info.md)
- [Cypress tests](doc/Cypress.md)

> Install dependencies using **yarn**

## `apps/web`

<details>
<summary>
How to start
</summary>

```sh
yarn
# 有时候依赖装不上报错，需要到web目录下，yarn run typechain
```

start the development server

```sh
# 跑这个 dev命令，才会映射本地的修改
yarn dev --no-daemon
```

build with production mode

```sh
# 必须加上后面这个  --no-daemon
yarn build  --no-daemon

# start the application after build。这个start命令跑的生产的配置，虽然也会在本地启动项目，但是本地修改了之后 不会触发改变
yarn start  --no-daemon
```

</details>

## `apps/aptos`

<details>
<summary>
How to start
</summary>

```sh
yarn dev:aptos
```

```sh
yarn turbo run build --filter=aptos-web
```

</details>

## `apps/blog`

<details>
<summary>
How to start
</summary>

```sh
yarn dev:blog
```

```sh
yarn turbo run build --filter=blog
```

</details>

## Packages

| Package                                    | Description                                                                                                 |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| [sdk](/packages/swap-sdk)                  | An SDK for building applications on top of Pancakeswap                                                      |
| [aptos-swap-sdk](/packages/aptos-swap-sdk) | Aptos version of Swap SDK                                                                                   |
| [swap-sdk-core](/packages/swap-sdk-core)   | Swap SDK Shared code                                                                                        |
| [wagmi](/packages/wagmi)                   | Extension for [wagmi](https://github.com/wagmi-dev/wagmi), including bsc chain and binance wallet connector |
| [awgmi](/packages/awgmi)                   | connect to Aptos with similar wagmi React hooks.                                                            |

## -1 代币相关

> bngtiger: 0xAC68931B666E086E9de380CFDb0Fb5704a35dc2D

> 官网: https://www.bnbtiger.top/static/picture/05.png

## 0 合约交互相关

> - **合约交互操作**：交互操作需要一个 json 文件和一个需要交互的合约
> - json 文件用来指定和合约交互的各种方法，如用 type 来指定 event 或者 function 或者 constructor
> - 合约：合约只要和上面的 json 文件契合就行了

## 1 主页面

> - 主菜单：外层调用的 menu，相当于 layout，包括所有数据的传入 apps\web\src\components\Menu\index.tsx。传参，从这里面传入，调用的是下面的 uikit 的 menu
> - 主菜单，纯 ui 文件，数据是从上面那里传入的。最外层布局文件：packages\uikit\src\widgets\Menu\Menu.tsx。 包含头部菜单和底部菜单，内容区是通过路由传入的
> - 所有菜单的配置文件：apps\web\src\components\Menu\config\config.ts
> - 菜单相关的路由元数据(改了菜单，这里也要进行修改才行)：apps\web\src\config\constants\meta.ts

> - 网络配置: 网络选择(展开与屏蔽测试网) apps\web\src\components\NetworkSwitcher.tsx
> - 修改网络配置(主网测试网什么的): apps\web\src\utils\wagmi.ts

> - 主页面，内容区 home；apps\web\src\views\Home\index.tsx；所有的列 就是这个组件

> - 布局文件底部的 footer：packages\uikit\src\components\Footer\Footer.tsx
> - footer 下面展示的所有链接。关于、说明、开发者 packages\uikit\src\widgets\Menu\components\footerConfig.ts

> - footer 下面的小链接图标 packages\uikit\src\components\Footer\config.tsx

## 2 swap 页面

> - swap 组件：apps\web\src\views\Swap\index.tsx
> - swap 的头部，设置，交易，热门代币 等一系列按钮：apps\web\src\views\Swap\components\CurrencyInputHeader.tsx
> - swap 组件外层的包裹组件，是继承自 uikit 的 swap，所有 swap 的基础都在 uikit 中: apps\web\src\views\Page.tsx
> - swap 组件基础组件 uikit 中的的 footer: packages\uikit\src\widgets\Swap\Footer.tsx
> - swap 页面和添加流动性界面，选择 token 的整个代币选择框外层的**整个 model**；管理代币的清单和代币也是这个父页面；apps\web\src\components\SearchModal\CurrencySearchModal.tsx
>   - swap 页面和添加流动性界面，选择 token 里层整个**选择代币页面**(搜索代币的框，和下面代币列表的框；加流动性也是弹出这个框);apps\web\src\components\SearchModal\CurrencySearch.tsx
>   - swap 页面和添加流动性界面，选择 token 里层整个**管理代币页面**;apps\web\src\components\SearchModal\Manage.tsx
>     - **管理代币页面下面默认展示的代币清单 cmc、cg 等**;apps\web\src\config\constants\lists.ts

> - Token 相关
>   - 处理 swap 页面，展示的 token 的 hook，apps\web\src\state\lists\hooks.ts
>   - 处理 swap 页面，展示的所有默认代币，简单说也就是白名单 token 的 json，apps\web\src\config\constants\tokenLists\pancake-default.tokenlist.json
>   - 所有页面 Token 对应的挖矿页面的图标(图标需要有一个 svg 一个 png,并且需要用 token 的名字做后缀): apps\web\public\images\tokens

> - 页面展示的 swap 对应的 Token 和价格
> - 修改页面展示的 swap 代币的价格：apps\web\src\hooks\useBUSDPrice.ts
> - 修改所有的基础 token(bnbtiger(Cake\usdt\usdc))之类的：packages\tokens\src\common.ts

## 3 Pool 单币质押页面

> - 单币质押挖矿页面 Pool:
>   - 包裹下面 PoolControls 内容的外层页面,这个页面没什么逻辑,只传入一个 pool: apps\web\src\views\Pools\index.tsx
>   - Pool 最上面的 search 条件和下面列表的内容区主 wrapper,和对应的 pool 列表的数据处理: packages\uikit\src\widgets\Pool\PoolControls.tsx
>     - Pool 的整个卡片布局页面：packages\uikit\src\widgets\Pool\PoolCard.tsx
>   - 年利率组件(Pool 最上面展示的年利率)：packages\uikit\src\widgets\Pool\Apr.tsx

> - 数据相关： 所有页面，pool 和 farm 页面的所有 reducer，apps\web\src\state\index.ts
>   - 存**所有数据的 Pool 的 reducer**，state 的 key 为 pools,和**从合约里面读取所有代币和 pool 相关的数据**： apps\web\src\state\pools\index.ts
>     - 给基础的**pool 数据增加页面要用的其它数据**：fetchPoolsPublicDataAsync 方法。如增加 totalStaked(总共质押数量)、startBlock、endBlock、stakingTokenPrice、earningTokenPrice、profileRequirement、apr，代币价格 参数
>       - 上面的那个函数中调用，类似 service，**从合约里面读取 pool 相关的各种参数，具体的一些方法**：apps\web\src\state\pools\fetchPools.ts
>   - 从 reducer 的 state 里面获取 pool 数据的 selector： apps\web\src\state\pools\selectors.ts
>   - **配置所有池子的配置文件**，结束的池子和未结束的池子都是这里：apps\web\src\config\constants\pools.tsx

> - 合约交互操作：
>   - pool 交互相关 abi 配置：apps\web\src\config\abi\sousChef.json

> 每一个 pool 都会调用 setPoolsPublicData 方法，来初始化质押相关的参数，这些都是从质押合约里面读出来的

> - Token 相关
>   - Token 图标: 所有页面 Token 对应的挖矿页面的图标(图标需要有一个 svg 一个 png,并且需要用 token 的名字做后缀): apps\web\public\images\tokens

> - 合约读取池子思路: 下面思路如果走不通，就需要去修改 selector 里面的池子数据，直接初始化它，说不定就行了
> - 最上层页面，调用 hook，然后从合约中读取所有的池子
> - 之前的池子配置文件，导出变量 allPool，把合约中国读出来的池子放到 allPool 上
> - 修改之前所有使用 pool 的地方，改为自己的这个 allPool 上的值
> - 需要注意，修改了 allPool 之后，函数外层定义的变量不会被修改，所以，对于赋值 pools = allPool.pools 的地方，要全部把他替换到函数内部去

## 4 Farm 农场页面

> - 单币质押挖矿页面 Farm:
>   - Farm 最上面的 search 条件和下面列表的内容区主 wrapper,和对应的 Farm 列表的数据处理(相当于上面 pool 的 2 个页面，这里整合到一个了): apps\web\src\views\Farms\Farms.tsx

> - 数据相关： 所有页面，pool 和 farm 页面的所有 reducer，apps\web\src\state\index.ts
>   - 存所有数据的 Farm 的 reducer，state 的 key 为 pools： apps\web\src\state\farms\index.ts
>   - 从 reducer 的 state 里面获取 Farm 数据的 selector： apps\web\src\state\farms\selectors.ts
>   - **配置所有 Farm 的配置文件**，结束的池子和未结束的 Farm 都是这里：packages\farms\constants\56.ts

> - 合约交互操作：
>   - 类似 service，从合约里面读取 pool 相关的各种参数：apps\web\src\state\pools\fetchPools.ts
>   - pool 交互相关 abi 配置：apps\web\src\config\abi\sousChef.json

> 每一个 pool 都会调用 setPoolsPublicData 方法，来初始化质押相关的参数，这些都是从质押合约里面读出来的

> - Token 相关
>   - Token 图标: 所有页面 Token 对应的挖矿页面的图标(图标需要有一个 svg 一个 png,并且需要用 token 的名字做后缀): apps\web\public\images\tokens

## 5 ido/ifo 页面

> - ifo 的整体布局页面：apps\web\src\views\Ifos\components\IfoContainer.tsx
> - ifo 顶部左边的质押 cake 和领取代币：apps\web\src\views\Ifos\components\IfoPoolVaultCard.tsx
> - active 的 ifo 右边的卡片整体 wrapper：apps\web\src\views\Ifos\components\IfoFoldableCard\index.tsx
>   - active 的 ifo 右边的卡片公开销售和私人销售卡片：apps\web\src\views\Ifos\components\IfoFoldableCard\IfoPoolCard\index.tsx

> - ifo 页面下面的详细配置：apps\web\src\views\Ifos\components\IfoQuestions\config.tsx

> - 自己写的页面:
> - 主页面: apps\web\src\views\Home\index.tsx
> - pools:
>   - 从合约拉取所有的池子的数据(在首页)：apps\web\src\pages\useInitPoolHook.ts
>   - 创建池子页面：apps\web\src\pages\pools\create-pools\index.tsx
> - ido 邀请人的数据页面: apps\web\src\views\Ifos\components\IfoFoldableCard\IfoPoolCard\IfoTopInviteInfo.tsx
> - nft mint 页面: apps\web\src\pages\nfts\index.tsx
