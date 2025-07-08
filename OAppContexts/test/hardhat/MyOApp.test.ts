import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { Contract, ContractFactory } from 'ethers'
import { deployments, ethers } from 'hardhat'

import { Options } from '@layerzerolabs/lz-v2-utilities'

describe('MyOApp Test', function () {
    // Constant representing a mock Endpoint ID for testing purposes
    const eidA = 1
    const eidB = 2
    // Declaration of variables to be used in the test suite
    let MyOAppContextsSender: ContractFactory
    let MyOAppContextsReceiver: ContractFactory
    let EndpointV2Mock: ContractFactory
    let ownerA: SignerWithAddress
    let ownerB: SignerWithAddress
    let endpointOwner: SignerWithAddress
    let myOAppA: Contract
    let myOAppB: Contract
    let mockEndpointV2A: Contract
    let mockEndpointV2B: Contract

    // Before hook for setup that runs once before all tests in the block
    before(async function () {
        // Contract factory for our tested contract
        MyOAppContextsSender = await ethers.getContractFactory('MyOAppContextsSender')
        MyOAppContextsReceiver = await ethers.getContractFactory('MyOAppContextsReceiver')

        // Fetching the first three signers (accounts) from Hardhat's local Ethereum network
        const signers = await ethers.getSigners()

        ;[ownerA, ownerB, endpointOwner] = signers

        // The EndpointV2Mock contract comes from @layerzerolabs/test-devtools-evm-hardhat package
        // and its artifacts are connected as external artifacts to this project
        //
        // Unfortunately, hardhat itself does not yet provide a way of connecting external artifacts,
        // so we rely on hardhat-deploy to create a ContractFactory for EndpointV2Mock
        //
        // See https://github.com/NomicFoundation/hardhat/issues/1040
        const EndpointV2MockArtifact = await deployments.getArtifact('EndpointV2Mock')
        EndpointV2Mock = new ContractFactory(EndpointV2MockArtifact.abi, EndpointV2MockArtifact.bytecode, endpointOwner)
    })

    // beforeEach hook for setup that runs before each test in the block
    beforeEach(async function () {
        // Deploying a mock LZ EndpointV2 with the given Endpoint ID
        mockEndpointV2A = await EndpointV2Mock.deploy(eidA)
        mockEndpointV2B = await EndpointV2Mock.deploy(eidB)

        // Deploying two instances of MyOApp contract and linking them to the mock LZEndpoint
        myOAppA = await MyOAppContextsSender.deploy(mockEndpointV2A.address, ownerA.address)
        myOAppB = await MyOAppContextsReceiver.deploy(mockEndpointV2B.address, ownerB.address)

        // Setting destination endpoints in the LZEndpoint mock for each MyOApp instance
        await mockEndpointV2A.setDestLzEndpoint(myOAppB.address, mockEndpointV2B.address)
        await mockEndpointV2B.setDestLzEndpoint(myOAppA.address, mockEndpointV2A.address)

        // Setting each MyOApp instance as a peer of the other
        await myOAppA.connect(ownerA).setPeer(eidB, ethers.utils.zeroPad(myOAppB.address, 32))
        await myOAppB.connect(ownerB).setPeer(eidA, ethers.utils.zeroPad(myOAppA.address, 32))
    })

    // A test case to verify context sending functionality
    it('should send a string message to each destination OApp', async function () {
        const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString()
        const context = ['0xAaE3cD458d297508F7365600BA57545344EE101a', '0xbD5Df698AC635717BC4e5b82bA0eC9d5F6981654']

        // Define native fee and quote for the message send operation
        let nativeFee = 0
        const messagingFee = await myOAppA.quoteSendContext(eidB, context, options, false)
        nativeFee = messagingFee.nativeFee

        // Execute sendContext operation from myOAppA
        await myOAppA.sendContext(eidB, context, options, { value: nativeFee.toString() })

        // Assert the resulting state of lastContext in MyOAppContextReceiver
        expect(await myOAppB.lastContext(0)).to.equal(context[0])
        expect(await myOAppB.lastContext(1)).to.equal(context[1])
    })
})
