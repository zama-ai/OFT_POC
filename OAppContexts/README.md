# OAppContexts POC quickstart

This POC will show how to deploy a unidirectonal OApp handling contexts propagation from Optimism testnet (analoguous to Zama Gateway chain) to Sepolia (an example of fhevm host chain). Contexts are represented as arrays of addresses, as expected in fhevm and Gateway chains.

## Step 1 : Initial setup

```
cp .env.example .env
```

Then fill the `PRIVATE_KEY` and `SEPOLIA_RPC_URL` in `.env` with your own values. Also, if you want to do Step 4 (Etherscan verification) which is optional but recommended for easier debugging, get an Etherscan free API key in order to set the value of `ETHERSCAN_API`.

## Step 2 : Funding deployer wallet on both chains

**Important:** Make sure the wallet address corresponding to your `PRIVATE_KEY` if funded on _both_ chains corresponding to this OFT, meaning on both Ethereum Sepolia and Optimism Sepolia. If you already have funds on Ethereum Sepolia, you can bridge part of it to Optimism Sepolia by depositing some funds to the official Optimism smart contract on Ethereum Sepolia:
For bridging some ETH from Sepolia Ethereum to Sepolia Optimism, go to this link https://sepolia.etherscan.io/address/0xfbb0621e0b23b5478b630bd55a5f21f67730b0f1#writeProxyContract and just click on "Connect to Web3" button, then click on the `bridgeETH` tab and fill the 3 fields with correct values (see example on image below): `bridgeETH` should be the amount of ETH you wish to bridge (ensure you have enough funds on Ethereum Sepolia first), `_minGasLimit` should be set to `300000` and you could set `_extraData` as `0x`. Send the transaction by clicking on write and confirm your transaction, then wait approximately for 2 minutes for the bridging flow to process.

![image](./BridgingToOptimismSepolia.png)

**Note:** If you want to add Sepolia Optimism to your (Metamask) wallet just go to this site https://chainlist.org/chain/11155420 and click on `Connect Wallet -> Approve`. This way, you could easily check if your bridging transaction was succesful: after waiting for 1-2 minutes the bridged sent funds should arrive on your wallet on Optimism Sepolia.

## Step 3 : Deploy MyOAppContextsReceiver on Sepolia and MyOAppContextsSender on Optimism testnet

```
pnpm i
npx hardhat lz:deploy
```

Then press enter to deploy on both networks.
When asked for ` Which deploy script tags would you like to use?` entre `MyOAppContexts`, then press enter again and wait few seconds to deploy the OApp contracts on both chains. Both addresses will be logged (one for each chain), the sender contract will be deployed on Optimism Sepolia testnet, while the receiver contract will be deployed on Ethereum Sepolia testnet.

## Step 4 : Etherscan verification (Optional)

In order verify the contract on Etherscan for the Ethereum Sepolia network, use this command (don't worry if the following scripts return you an error or an invalid explorer URL link - see the note at the end of this step):

```
pnpm verify:etherscan:ethereum:sepolia
```

And for the Optimism Sepolia network run:

```
pnpm verify:etherscan:optimism:sepolia
```

**Note:** Due to a bug in the `verify-contract` task, sometimes those scripts will log an error and/or return a wrong URL for block explorer link, but most of the times, despite those errors, if you check the actual results by searching for corresponding contracts addresses on the block explorer, you will notice that the contracts will actually be succesfully verified after running those commands (i.e [https://sepolia.etherscan.io/](https://sepolia.etherscan.io/) for Ethereum testnet and [https://sepolia-optimism.etherscan.io/](https://sepolia-optimism.etherscan.io/) for Optimism testnet).

## Step 5 : Wire both contracts

```
npx hardhat lz:oapp:wire --oapp-config layerzero.config.ts
```

And follow straightforward instructions to wire the OFT contracts. Contrarily to the OFT and OFTAdapter POCs, this wiring will be unidirectional because we only need to send messages from Optimism to Sepolia, and not the other way around.

## Step 6 : Cross-chain context propagation

For example if you want to send a context array defined by `[0xAaE3cD458d297508F7365600BA57545344EE101a,0xbD5Df698AC635717BC4e5b82bA0eC9d5F6981654]` from Optimism testnet to Ethereum testnet:

```
npx hardhat lz:oapp:send --dst-eid 40161 --context '["0xAaE3cD458d297508F7365600BA57545344EE101a","0xbD5Df698AC635717BC4e5b82bA0eC9d5F6981654"]' --network optimism-testnet
```

Once this transaction is sent, wait around 2 minutes and check that the `MyOAppContextsReceiver` contract on Etherscan Sepolia has indeed received the new context, by calling the `lastContext` view function in the `Read Contract` tab (make sure the contract has been verified first by following step 4). When you call the `lastContext` with the `0` value, it should return the first address `0xAaE3cD458d297508F7365600BA57545344EE101a` and while calling it with the `1` value you should get the second one `0xbD5Df698AC635717BC4e5b82bA0eC9d5F6981654`.
