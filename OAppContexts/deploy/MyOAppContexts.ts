import assert from 'assert'

import { type DeployFunction } from 'hardhat-deploy/types'

// TODO declare your contract name here
const contractName = 'MyOAppContexts'

const deploy: DeployFunction = async (hre) => {
    const { getNamedAccounts, deployments } = hre

    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    assert(deployer, 'Missing named deployer account')

    console.log(`Network: ${hre.network.name}`)
    console.log(`Deployer: ${deployer}`)

    // This is an external deployment pulled in from @layerzerolabs/lz-evm-sdk-v2
    //
    // @layerzerolabs/toolbox-hardhat takes care of plugging in the external deployments
    // from @layerzerolabs packages based on the configuration in your hardhat config
    //
    // For this to work correctly, your network config must define an eid property
    // set to `EndpointId` as defined in @layerzerolabs/lz-definitions
    //
    // For example:
    //
    // networks: {
    //   fuji: {
    //     ...
    //     eid: EndpointId.AVALANCHE_V2_TESTNET
    //   }
    // }
    const endpointV2Deployment = await hre.deployments.get('EndpointV2')
    if (hre.network.name === 'ethereum-testnet') {
        const { address } = await deploy(contractName + 'Receiver', {
            from: deployer,
            args: [
                endpointV2Deployment.address, // LayerZero's EndpointV2 address
                deployer, // owner
            ],
            log: true,
            skipIfAlreadyDeployed: false,
        })
        console.log(`Deployed contract: ${contractName}Receiver, network: ${hre.network.name}, address: ${address}`)
    } else {
        const { address } = await deploy(contractName + 'Sender', {
            from: deployer,
            args: [
                endpointV2Deployment.address, // LayerZero's EndpointV2 address
                deployer, // owner
            ],
            log: true,
            skipIfAlreadyDeployed: false,
        })
        console.log(`Deployed contract: ${contractName}Sender, network: ${hre.network.name}, address: ${address}`)
    }
}

deploy.tags = [contractName]

export default deploy
