// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

// MyOApp imports
import { MyOAppContextsSender, MessagingFee } from "../../contracts/MyOAppContextsSender.sol";
import { MyOAppContextsReceiver } from "../../contracts/MyOAppContextsReceiver.sol";

// OApp imports
import { IOAppOptionsType3, EnforcedOptionParam } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OAppOptionsType3.sol";
import { OptionsBuilder } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OptionsBuilder.sol";

// OZ imports
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

// Forge imports
import "forge-std/console.sol";

// DevTools imports
import { TestHelperOz5 } from "@layerzerolabs/test-devtools-evm-foundry/contracts/TestHelperOz5.sol";

contract MyOAppTest is TestHelperOz5 {
    using OptionsBuilder for bytes;

    uint32 private aEid = 1;
    uint32 private bEid = 2;

    MyOAppContextsSender private aOApp;
    MyOAppContextsReceiver private bOApp;

    address private userA = address(0x1);
    address private userB = address(0x2);
    uint256 private initialBalance = 100 ether;

    function setUp() public virtual override {
        vm.deal(userA, 1000 ether);
        vm.deal(userB, 1000 ether);

        super.setUp();
        setUpEndpoints(2, LibraryType.UltraLightNode);

        aOApp = MyOAppContextsSender(_deployOApp(type(MyOAppContextsSender).creationCode, abi.encode(address(endpoints[aEid]), address(this))));

        bOApp = MyOAppContextsReceiver(_deployOApp(type(MyOAppContextsReceiver).creationCode, abi.encode(address(endpoints[bEid]), address(this))));

        address[] memory oapps = new address[](2);
        oapps[0] = address(aOApp);
        oapps[1] = address(bOApp);
        this.wireOApps(oapps);
    }

    function test_constructor() public view {
        assertEq(aOApp.owner(), address(this));
        assertEq(bOApp.owner(), address(this));

        assertEq(address(aOApp.endpoint()), address(endpoints[aEid]));
        assertEq(address(bOApp.endpoint()), address(endpoints[bEid]));
    }

    function test_send_context() public {
        bytes memory options = OptionsBuilder.newOptions().addExecutorLzReceiveOption(200000, 0);
        address[] memory message = new address[](2);
        message[0] = 0xAaE3cD458d297508F7365600BA57545344EE101a;
        message[1] = 0x3B97f0c0f81Ca59eC6f997Dd25C27A608eA885E9;
        MessagingFee memory fee = aOApp.quoteSendContext(bEid, message, options, false);


        vm.prank(userA);
        aOApp.sendContext{ value: fee.nativeFee }(bEid, message, options);
        verifyPackets(bEid, addressToBytes32(address(bOApp)));

        assertEq(bOApp.lastContext(0), message[0]);
        assertEq(bOApp.lastContext(1), message[1]);
    }
}
