# OFT_POC quickstart

## Step 1 : Initial setup

```
cp .env.example .env
```

Then fill the `PRIVATE_KEY` and `SEPOLIA_RPC_URL` in `.env` with your own values.

## Step 2 : Funding deployer wallet on both chains

**Important:** Make sure the wallet address corresponding to your `PRIVATE_KEY` if funded on _both_ chains corresponding to this OFT, meaning on both Ethereum Sepolia and Optimism Sepolia. If you already have funds on Ethereum Sepolia, you can bridge part of it to Optimism Sepolia by depositing some funds to the official Optimism smart contract on Ethereum Sepolia:
For bridging some ETH from Sepolia Ethereum to Sepolia Optimism, go to this link https://sepolia.etherscan.io/address/0xfbb0621e0b23b5478b630bd55a5f21f67730b0f1#writeProxyContract and just click on "Connect to Web3" button, then click on the `bridgeETH` tab and fill the 3 fields with correct values (see example on image below): `bridgeETH` should be the amount of ETH you wish to bridge (ensure you have enough funds on Ethereum Sepolia first), `_minGasLimit` should be set to `300000` and you could set `_extraData` as `0x`. Send the transaction by clicking on write and confirm your transaction, then wait approximately for 2 minutes for the bridging flow to process.

![image](./BridgingToOptimismSepolia.png)

Note: If you want to add Sepolia Optimism to your (Metamask) wallet just go to this site https://chainlist.org/chain/11155420 and click on `Connect Wallet -> Approve`. This way, you could easily check if your bridging transaction was succesful: after waiting for 1-2 minutes the bridged sent funds should arrive on your wallet on Optimism Sepolia.

## Step 3 : Deploy MyOFTMock on both chains

```
pnpm i
npx hardhat lz:deploy
```

Then press enter to deploy on both networks.
When asked for ` Which deploy script tags would you like to use?` entre `MyOFTMock`, then press enter again and wait few seconds to deploy the OFT on both chains. Both addresses will be logged (one for each chain) and during deployment, your deployer account will automatically get `100` MyOFTMock tokens minted to himself on the Sepolia Ethereum chain exclusively (no minted value at deployment on Optimism testnet).

## Step 4 : Wire both contracts

```
npx hardhat lz:oapp:wire --oapp-config layerzero.config.ts
```

And follow straightforward instructions to wire the OFT contracts.

## Step 5 : Cross-chain transfer

For example you can send `1.5` MyOFTMock token from the deployer wallet to a custom receiver address by running this command and following instructions:

```
npx hardhat lz:oft:send --src-eid 40161 --dst-eid 40232 --amount 1.5 --to [RECEIVER ADDRESS]
```

Once this transaction is sent, wait around 2 minutes and check the receiver's account on Etherscan Optimism Sepolia explorer that the receiver indeed received `1.5` MyOFTMock on Optimism testnet by clicking on `Token Holdings` there.

You could then also send back the tokens from Optimism Sepolia testnet to Ethereum Sepolia chain, by swapping the values of `--src-eid` and `--dst-eid` flags from previous command.
