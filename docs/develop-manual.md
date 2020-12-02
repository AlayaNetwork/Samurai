## Samurai开发手册

### 1.简介
Samurai是基于以太坊web钱包Metamask进行fork的，针对alaya网络进行适配性的修改, 以满足基于alaya网络的安全和可用性的需求。用户可以很方便的管理账户并连接到alaya网络。

### 2.安装

+ 下载[Samurai插件包](https://github.com/AlayaNetwork/Samurai/releases/download/v8.0.10/samurai-chrome-8.0.10.zip)
+ 解压Samurai插件包
+ [通过chrome加载已解压的插件包](./add-to-chrome.md)
### 3.使用

#### 3.1 API列表

##### Alaya JSON-RPC API
有关Alaya JSON-RPC API的信息，请参阅[Alaya-devdocs](https://devdocs.alaya.network/alaya-devdocs/zh-CN/Json_Rpc/)

比较重要的API方法如下：
+ platon_accounts
+ platon_call
+ platon_getBalance
+ platon_sendTransaction
+ platon_sign

##### 权限相关
+ platon_requestAccounts
+ wallet_requestPermissions
+ wallet_getPermissions

##### 其他RPC API
+ wallet_registerOnboarding
+ wallet_watchAsset

#### 4. Example
下面的例子演示如何在web console端发起普通和合约交易操作，唤起Samurai进行交易处理。

在开启Samurai并已经导入账户后，打开一个新的页面。右击->检查->console进入调试模式(后面的命令行均在console中执行)。Samurai在打开页面会注入alaya和web3a对象,因此在console中可以直接使用。
##### 4.1 普通交易
+ 请求Samurai用户授权, 运行下面命令会唤起Samurai界面，选择对应的账户同意即可授权页面连接权限
```
> alaya.request({ method: 'platon_requestAccounts' });
Promise {<pending>}
> alaya.selectedAddress
"atp1mm09yjr8vwr2g78gselj03w2eks7atq2jrjlww"
```
+ 发起ATP转账交易, 运行下面的命令会唤起Samurai处理该交易，可以进行再编辑等操作
```
> web3a.platon.sendTransaction({from: alaya.selectedAddress,to: "atp1dt2wx0xjkd2je8ev4t3ysmte6n90kc9gm9mkrr", value: 1e16}, function(err, transactionHash) {if (err) { console.log(err); } else {console.log(transactionHash);}});
```

##### 4.2 Dapp开发集成
在开发Dapp页面，由于Samurai在打开页面会注入alaya对象，因此在开发的时候可以通过javascript直接调用该对象完成对应的操作。需要web3a对象的引入及使用见[js-sdk文档](https://devdocs.alaya.network/alaya-devdocs/zh-CN/JS_SDK/)

下面例子展示的是比如点击一个页面按钮发起转账操作，在其后调用的对应的javascript脚本

```
var Web3A = require('web3');
var web3alaya = new Web3A(alaya)
contract = new web3alaya.platon.Contract(abi, address);
toAccount = "atp1jtfqqqr6436ppj6ccnrh8xjg7qals3ctnnmurp";
transferBalance = 1000000000000000;
contract.methods.transfer(toAccount,transferBalance)
  .send({from:alaya.selectedAddress, gas:4712388})
  .then(function(receipt){
    console.log("receipt: ", receipt);
  }).catch(function(err) {
    console.log('err: ', err);
  })
```

