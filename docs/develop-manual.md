## Samurai开发手册

### 1.简介
Samurai是基于以太坊web钱包Metamask进行fork的，针对alaya网络进行适配性的修改, 以满足基于alaya网络的安全和可用性的需求。用户可以很方便的管理账户并连接到alaya网络。

### 2.安装

+ 下载[Samurai插件包](https://github.com/AlayaNetwork/Samurai/releases/download/v8.0.11/samurai-chrome-8.0.11.zip)
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

其中alaya是一个provider对象，是Samurai钱包最基本的功能。web3a对象是注入了js sdk的一个版本，为了实现web钱包和js sdk的相对独立，Metamask钱包已经停止对注入对象web3的支持，在Samurai钱包中虽然还没有停止对web3a对象的支持，但无疑使用[js sdk教程](https://devdocs.alaya.network/alaya-devdocs/zh-CN/JS_SDK/)中的方法注入PW3方式可以使用最新版本的js sdk。

以下所有代码都可以在https://github.com/RileyGe/alaya-js-sdk-examples项目中找到。

##### 4.1 推荐Samurai钱包调用方法

在web页面中，推荐使用alaya对象，而不推荐使用web3a对象。

- 注入PW3对象。可以自己编译web3.js文件，也可以直接引用https://cdn.jsdelivr.net/gh/RileyGe/client-sdk-js@0.11.1/dist/web3a.js或者https://cdn.jsdelivr.net/gh/RileyGe/client-sdk-js@0.11.1/dist/web3a.min.js。详情请参照https://devdocs.alaya.network/alaya-devdocs/zh-CN/JS_SDK/
- 使用`let window.pw3 = PW3(window.alaya)`的方式初始化全局`pw3`变量。
- 使用`pw3`进行区块链的相关操作。

##### 4.2 检验是否安装Samurai钱包及连接Samurai钱包

Samurai钱包与MetaMask钱包的用法基本相同，不同的是Samurai向浏览器中注入的provider为alaya。在检验是否安装Samurai及连接Samurai钱包时主要使用alaya对象进行操作。

```javascript
function checkAndConnect() {
    // Samurai钱包会向浏览器中注入provider:windows.alaya
    // 如果window.alaya存在，则说明已经安装了Samurai钱包
	if (window.alaya) {
        // 通过向alaya发送platon_requestAccounts请求，来进行Samurai钱包的连接。
		window.alaya.request({
			method: 'platon_requestAccounts'
        });
        window.pw3 = new PW3(window.alaya);
    } else {
        alert('请安装Samurai')
    }
}
```

##### 4.3 普通交易
+ 获取事件详细信息，使用call方式发送请求，不会唤起Samurai授权。
```javascript
function getTransInfo(){
    let transHash = "0x19bc42309dbf96be0a5ca5689fa8b8e1637a7877b9b295c748264162981fb050";
    pw3.platon.getTransaction(transHash).then(function(transInfo){
        console.log(transInfo);
    });
}
```
+ 发起ATP转账交易, 运行下面的命令会唤起Samurai处理该交易，可以进行再编辑等操作
```javascript
function sendATP(){
    let rawTx = {
        from: alaya.selectedAddress,
        to: "atp1886776udz7t32d9vj7sfcqrxugmpnzlj0zrl5x",
        value: 1e16
    }
    pw3.platon.sendTransaction(rawTx, function(err, transactionHash) {
        if (err) {
            console.log(err);
        } else {
            console.log(transactionHash);
        }
    });
}
```

##### 4.4 Dapp开发集成
在开发Dapp页面，由于Samurai在打开页面会注入alaya对象，因此在开发的时候可以通过javascript直接调用该对象完成对应的操作。需要web3a对象的引入及使用见[js-sdk文档](https://devdocs.alaya.network/alaya-devdocs/zh-CN/JS_SDK/)

下面例子展示的是比如点击一个页面按钮发起转账操作，在其后调用的对应的javascript脚本

```javascript
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

##### 4.5 调用内置合约

新升级的js sdk对内置合约的调用进行了大量改进，可以非常快速的对alaya的内置合约进行调用。下文中的部分示例使用了修改后的jsonMate来显示json结果。更多细节及完整案例请参照[用户操作页面](https://rileyge.github.io/alaya-js-sdk-examples/actions.html)。

- 获取所有节点列表

```javascript
function getNodesList() {
    document.getElementById("node_list_btn").innerHTML = "正在查询。。。"
    let data = {
        funcType: 1102,
    }
    pw3.ppos.call(data).then(function (result) {
        // console.log(result);
        let opt = {
            change: function (data) {  },
            propertyclick: function (path) {  }
        };        
        $('#json_div').jsonEditor(result, opt);
        document.getElementById("node_list_btn").innerHTML = "查询"
    });
}
```

- 委托（使用buildTransaction创建交易）

```javascript
function delegate() {
    let nodeId = document.getElementById("nodeid").value;
    let amount = document.getElementById("delegate_amount").value;
    let coin_type = document.getElementById("cn_type") * 1;
    try {
        let params = {
            funcType: 1004,
            typ: coin_type,
            nodeId: PW3.PPOS.hexToBuffer(nodeId),
            amount: pw3.utils.toBN(pw3.utils.toVon(amount))
        }
        // pw3.ppos.estimateGasGaspriceThenSend(params);
        pw3.ppos.buildTransaction(params)
            .then(function (rawTx) {
            pw3.platon.accounts.signTransaction(rawTx).then(function (signTx) {
                web3.platon.sendSignedTransaction(signTx.rawTransaction).then(function (reply) {
                    console.log(reply);
                });
            });
        });
    } catch (error) {
        console.log(error);
    }
}
```

- 获取所有抵押奖励

```javascript
function getAllReward() {
    let reward_adderss = pw3.currentProvider.selectedAddress;
    let data = {
        funcType: 5000
    }
    pw3.ppos.estimateGasGaspriceThenSend(data).then(function (result) {
        // console.log(result);
        let opt = {
            change: function (data) {  },
            propertyclick: function (path) {  }
        };
        $('#json_div_get_reward').jsonEditor(result, opt);
    });
}
```

- 撤销抵押

```javascript
function undelegate() {
    try {
        let nodeId = document.getElementById("nodeid").value;
        let data = {
            funcType: 1105,
            nodeId: PW3.PPOS.hexToBuffer(nodeId)
        }
        pw3.ppos.call(data).then(function (result) {
            let staking_block_num = result.Ret.StakingBlockNum;
            let amount = document.getElementById("undelegate_amount").value;
            let params = {
                funcType: 1005,
                stakingBlockNum: staking_block_num,
                nodeId: PW3.PPOS.hexToBuffer(nodeId),
                amount: PW3.utils.toBN(PW3.utils.toVon(amount))
            }            
            pw3.ppos.estimateGasGaspriceThenSend(params);
        });
    } catch (error) {
        console.log(error);
    }
}
```

- 获取节点信息

  以下的几个例子主要关于节点的相关操作。完整的例子可以参照[节点操作页面](https://rileyge.github.io/alaya-js-sdk-examples/nodes.html)。

```javascript
function getNodeInfo() {
    var nodeId = document.getElementById("nodeid").value;
    let data = {
        funcType: 1105,
        nodeId: PW3.PPOS.hexToBuffer(nodeId)
    }
    pw3.ppos.call(data).then(function (result) {
        console.log(result);
        document.getElementById("node_name").value = result.Ret.NodeName;
        document.getElementById("operation_address").innerHTML = result.Ret.StakingAddress;
        document.getElementById("benefit_address").value = result.Ret.BenefitAddress;
        document.getElementById("website").value = result.Ret.Website;
        document.getElementById("reward_per").value = result.Ret.RewardPer;
        document.getElementById("external_id").value = result.Ret.ExternalId;
        document.getElementById("details").value = result.Ret.Details;
    });
}
```

- 修改节点信息

```javascript
function changeNodeInfo() {
    const benefitAddress = document.getElementById("benefit_address").value;
    const nodeId = document.getElementById("nodeid").value;
    const reward = document.getElementById("reward_per").value*1;
    const exid = document.getElementById("external_id").value;
    const nodeName = document.getElementById("node_name").value;
    const website = document.getElementById("website").value;
    const details = document.getElementById("details").value;                
    try {
        let params = {
            funcType: 1001,
            benefitAddress: PW3.PPOS.hexToBuffer(PW3.utils.decodeBech32Address(benefitAddress)),
            nodeId: PW3.PPOS.hexToBuffer(nodeId),
            rewardPer: reward, //传500就是5%的奖励作为委托奖励
            externalId: exid,
            nodeName: nodeName,
            website: website,
            details: details,
        }
        pw3.ppos.estimateGasGaspriceThenSend(params)
            .catch(function(error){
            console.log(error);
            alert(error.message);
        });
    } catch (error) {
        console.log(error);
    }
}
```

  