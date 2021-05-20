## Samurai Use Tutorials

### 1.Installation

+ Download Samurai plug-in package from [official address](https://github.com/AlayaNetwork/Samurai/releases/download/v8.1.0/samurai-chrome-8.1.0.zip)
+ Unzip Samurai plug-in package
+ Open chrome browser,input “chrome://extensions/” in the address bar and Enter,enter the management page of chrome extension program.

```
chrome://extensions/
```

+ Open the switch of **developer mode**,select to **load the unzipped extension program**,select the unzipped catalogue of the 2nd step

![](./images/add-chrome.jpg)

### 2. Create and manage an account

2.1 Click the Samurai icon on the right side of browser address bar,when you use it for the first time,there will be a prompt as shown below:

![](./images/samurai-welcome-en.jpg)

2.2  Click “**Get Started**”,there is two options-**create wallet** and **import wallet**.

![](./images/samurai-select-action-en.jpg)

+ Import wallet:click “**import wallet**”，enter the boot page,click “**I agree**” and enter the next step.Then input **the mnemonic words** and **password** of this wallet,and click “**import**”->Once all steps is completed,you can enter the main interface

![](./images/samurai-agreement-en.jpg)

![](./images/samurai-import-seed-en.jpg)

![](./images/samurai-import-end-en.jpg)

![](./images/samurai-import-home-en.jpg)

+ Create wallet:click “**create wallet**”,enter the boot page,click “**I agree**” and enter the next step.Then input the **password** of new wallet,and click “**create**”

![](./images/samurai-create-password-en.jpg)

+ Go to the mnemonic backup screen, click “CLICK  HERE TO REVEAL SECRET WORDS”to show the mnemonic words of the new account (mnemonic words need to be prevented from being seen by others, Samurai uses the password you provided to encrypt this information locally and will never send it to the server), click “**Reminder me later**” to go directly to the Samurai main screen of the new account

![](./images/samurai-create-seed-en.jpg)

+ Click “**ext step**”,re-input the mnemonic words with the right sequence,click “**confirm**”->Once all steps is completed,you can enter the main interface

![](./images/samurai-create-seed-confirm.jpg)

![](./images/samurai-import-end-en.jpg)

![](./images/samurai-create-home-en.jpg)

### 3.Transaction Operation

#### 3.1 Send ATP

+ Click “**send**”on the main interface,and you can see the **add recipient** interface

![](./images/samurai-send-address-input-en.jpg)

+ Enter or select the address for **transfer between my accounts**,and go to the transaction form interface

![](./images/samurai-send-input-en.jpg)

+ The transaction form must fill in the number of transaction ATP, and the system will give you the default transaction fee. You can also make appropriate adjustments to this value. After completing the form, click “**next**” to enter the page to be confirmed, which will show the total number of ATP spent (including the handling fee)

![](./images/samurai-send-confirm-en.jpg)

+ Click “**Confirm**” to complete the sending of ATP,and you can view the transaction status in the **Activity** on the main page

![](./images/samurai-tx-detail-en.jpg)

#### 3.2 Add and send Token

#### Add Token

+ Enter the main interface,click **Assets** -> **Add Token**

![](./images/samurai-home-add-token-en.jpg)

+ Pop-up the “Add Tokens” interface,add the existed  **token contract address** of connected network,Samurai will automatically to get token’s symbol and exact decimal point,click “**Next**” when you completed all the steps

![](./images/samurai-add-token-input-en.jpg)

+ Enter the confirm interface of Add Tokens,there will show the balance of this token under this account,click “**Add Tokens**”to add successfully

![](./images/samurai-add-token-confirm-en.jpg)

+ After the account is successfully added, go to the token display screen, which displays the balance of tokens, or you can click “**send**” to enter the token transfer interface. At the same time, the asset list of the main interface will display the token assets

![](./images/samurai-token-display-en.jpg)

#### Token Transfer

+ You can click “**send**” in the account token display interface to initiate the token transfer, or you can click  “**send**” of the corresponding token in the asset list interface of the main interface to initiate the transfer

![](./images/samurai-assets-list-en.jpg)

+ Enter the **add recipient** interface, enter or select the address for **transfer between my accounts** as you would for sending ATP, and enter the transaction form interface

![](./images/samurai-send-token-input-en.jpg)

+ The transaction form must enter the number of tokens for the transaction. Click “Next” to enter the transaction confirmation interface

![](./images/samurai-send-token-confirm-en.jpg)

+ Click “**Confirm**” to complete the sending of tokens,you can view the transaction status in the transaction list on the main interface

![](./images/samurai-token-tx-detail-en.jpg)

### 4.Network Management

+ By default, Samurai connects to the PlatON Main network, or it can connect to its own network of nodes. Click “**Networks**”-> **Custom RPC**

![](./images/network-en.jpg)

+ Enter the new network configuration interface, and click “**Save**” after configuring the form

![](./images/network-form-en.jpg)

+ Samurai will try to connect to the node, and if the node fails to connect, it will pop up a corresponding dialog prompt

![](./images/network-connect-error-en.jpg)

+ If the connection is successful, a network list option will be added to the network list

![](./images/network-add-success-en.jpg)
