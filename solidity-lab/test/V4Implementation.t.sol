// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {PoolManager} from "v4-core/src/PoolManager.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {IUnlockCallback} from "v4-core/src/interfaces/callback/IUnlockCallback.sol";
import {BalanceDelta} from "v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "v4-core/src/types/BeforeSwapDelta.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {ModifyLiquidityParams, SwapParams} from "v4-core/src/types/PoolOperation.sol";
import {Pool} from "v4-core/src/libraries/Pool.sol";
import {LPFeeLibrary} from "v4-core/src/libraries/LPFeeLibrary.sol";
import {StateLibrary} from "v4-core/src/libraries/StateLibrary.sol";
import {SwapMath} from "v4-core/src/libraries/SwapMath.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";
import {TransientStateLibrary} from "v4-core/src/libraries/TransientStateLibrary.sol";
import {V4Router} from "v4-periphery/src/V4Router.sol";
import {IV4Router} from "v4-periphery/src/interfaces/IV4Router.sol";
import {Actions} from "v4-periphery/src/libraries/Actions.sol";
import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";

interface LocalVm {
    function etch(address target, bytes calldata code) external;
}

contract TutorialFeeHook {
    IPoolManager immutable manager;
    address immutable instructor;

    constructor(IPoolManager manager_) {
        manager = manager_;
        instructor = msg.sender;
    }

    function setStoredFee(PoolKey memory key, uint24 fee) external {
        require(msg.sender == instructor);
        manager.updateDynamicLPFee(key, fee);
    }

    function beforeSwap(address, PoolKey calldata, SwapParams calldata, bytes calldata hookData)
        external
        view
        returns (bytes4, BeforeSwapDelta, uint24)
    {
        require(msg.sender == address(manager));
        uint24 value = hookData.length == 0 ? 0 : abi.decode(hookData, (uint24)) | LPFeeLibrary.OVERRIDE_FEE_FLAG;
        return (IHooks.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, value);
    }
}

contract TutorialActionsRouter is V4Router {
    address private payer;

    constructor(IPoolManager manager) V4Router(manager) {}

    function execute(bytes calldata data) external {
        require(payer == address(0));
        payer = msg.sender;
        _executeActions(data);
        payer = address(0);
    }

    function msgSender() public view override returns (address) {
        return payer;
    }

    function _pay(Currency currency, address sender, uint256 amount) internal override {
        assert(MockERC20(Currency.unwrap(currency)).transferFrom(sender, address(poolManager), amount));
    }
}

contract V4ImplementationTest is IUnlockCallback {
    using PoolIdLibrary for PoolKey;
    using StateLibrary for IPoolManager;
    using TransientStateLibrary for IPoolManager;

    enum Operation {
        Liquidity,
        Swap,
        TwoHops
    }
    enum Settlement {
        Normal,
        SkipPayment,
        SkipTake,
        WrongAccount
    }
    LocalVm constant vm = LocalVm(address(uint160(uint256(keccak256("hevm cheat code")))));
    uint160 constant Q96 = 1 << 96;
    int256 constant LIQUIDITY = 1e12;
    uint256 constant BUDGET = 1e10;
    uint24 constant STATIC_FEE = 3_000;
    uint24 constant OVERRIDE_FEE = 12_000;
    IPoolManager manager;
    PoolKey first;
    PoolKey second;

    function setUp() public {
        manager = new PoolManager(address(this));
        address[3] memory tokens = [
            address(new MockERC20("Token A", "A", 18)),
            address(new MockERC20("Token B", "B", 18)),
            address(new MockERC20("Token C", "C", 18))
        ];
        for (uint256 i; i < tokens.length; ++i) {
            for (uint256 j = i + 1; j < tokens.length; ++j) {
                if (tokens[j] < tokens[i]) (tokens[i], tokens[j]) = (tokens[j], tokens[i]);
            }
            MockERC20(tokens[i]).mint(address(this), 1e20);
        }
        first = PoolKey(Currency.wrap(tokens[0]), Currency.wrap(tokens[1]), STATIC_FEE, 60, IHooks(address(0)));
        second = PoolKey(Currency.wrap(tokens[1]), Currency.wrap(tokens[2]), STATIC_FEE, 60, IHooks(address(0)));
        manager.initialize(first, Q96);
        manager.initialize(second, Q96);
        addLiquidity(first, -120, 120, LIQUIDITY, bytes32(uint256(1)));
        addLiquidity(second, -120, 120, LIQUIDITY, bytes32(uint256(1)));
    }

    function testPoolIdMatchesAbiEncodingAndIsolatesState() public {
        PoolKey memory another = first;
        another.tickSpacing = 10;
        assert(PoolId.unwrap(first.toId()) == keccak256(abi.encode(first)));
        assert(PoolId.unwrap(another.toId()) != PoolId.unwrap(first.toId()));
        manager.initialize(another, TickMath.getSqrtPriceAtTick(10));

        (uint160 p0, int24 t0,, uint24 lp0) = manager.getSlot0(first.toId());
        (uint160 p1, int24 t1,, uint24 lp1) = manager.getSlot0(another.toId());
        assert(p0 == Q96 && t0 == 0 && lp0 == STATIC_FEE);
        assert(p1 > p0 && t1 == 10 && lp1 == STATIC_FEE);
        assert(manager.getLiquidity(first.toId()) == uint128(uint256(LIQUIDITY)));
        assert(manager.getLiquidity(another.toId()) == 0);
    }

    function testSwapReturnsActualDeltaAtPriceLimit() public {
        uint160 limit = TickMath.getSqrtPriceAtTick(-10);
        BalanceDelta delta = runSwap(first, true, -int256(BUDGET), limit, "");
        assert(delta.amount0() < 0 && uint128(-delta.amount0()) < BUDGET);
        assert(delta.amount1() > 0);
        (uint160 updatedPrice,,,) = manager.getSlot0(first.toId());
        assert(updatedPrice == limit);
    }

    function testSwapStepMatchesBrowserExactInAndOut() public pure {
        uint160 target = TickMath.getSqrtPriceAtTick(-120);
        assert(target == 78754240422856966435523493930);
        assert(TickMath.getSqrtPriceAtTick(-60) == 78990846045029531151608375686);
        assert(TickMath.getSqrtPriceAtTick(60) == 79466191966197645195421774833);
        assert(TickMath.getSqrtPriceAtTick(120) == 79704936542881920863903188246);
        (, uint256 amountIn, uint256 amountOut, uint256 fee) =
            SwapMath.computeSwapStep(Q96, target, 1_000_000, -5_000, STATIC_FEE);
        assert(amountIn == 4_985 && amountOut == 4_960 && fee == 15);

        (, amountIn, amountOut, fee) = SwapMath.computeSwapStep(Q96, target, 1_000_000, 5_000, STATIC_FEE);
        assert(amountIn == 5_026 && amountOut == 5_000 && fee == 16);
    }

    function testSwapPeripheryDecodesActionsAndEnforcesMinimumOutput() public {
        TutorialActionsRouter router = new TutorialActionsRouter(manager);
        MockERC20 input = MockERC20(Currency.unwrap(first.currency0));
        MockERC20 output = MockERC20(Currency.unwrap(first.currency1));
        uint128 budget = uint128(BUDGET / 4);
        input.approve(address(router), budget);

        bytes memory actions =
            abi.encodePacked(uint8(Actions.SWAP_EXACT_IN_SINGLE), uint8(Actions.SETTLE_ALL), uint8(Actions.TAKE_ALL));
        bytes[] memory params = new bytes[](3);
        params[1] = abi.encode(first.currency0, uint256(budget));
        params[2] = abi.encode(first.currency1, uint256(1));

        IV4Router.ExactInputSingleParams memory swapParams =
            IV4Router.ExactInputSingleParams(first, true, budget, budget, 0, "");
        params[0] = abi.encode(swapParams);
        try router.execute(abi.encode(actions, params)) {
            revert("expected V4TooLittleReceived");
        } catch (bytes memory reason) {
            assert(bytes4(reason) == IV4Router.V4TooLittleReceived.selector);
        }

        swapParams.amountOutMinimum = 1;
        params[0] = abi.encode(swapParams);
        uint256 inputBefore = input.balanceOf(address(this));
        uint256 outputBefore = output.balanceOf(address(this));
        router.execute(abi.encode(actions, params));
        assert(inputBefore - input.balanceOf(address(this)) == budget);
        assert(output.balanceOf(address(this)) > outputBefore);
    }

    function testLiquidityCrossingAndDistinctSalts() public {
        addLiquidity(first, -120, 120, LIQUIDITY, bytes32(uint256(2)));
        addLiquidity(first, 120, 240, LIQUIDITY / 2, bytes32(uint256(3)));
        assert(manager.getLiquidity(first.toId()) == uint128(uint256(2 * LIQUIDITY)));
        (uint128 a,,) = manager.getPositionInfo(first.toId(), address(this), -120, 120, bytes32(uint256(1)));
        (uint128 b,,) = manager.getPositionInfo(first.toId(), address(this), -120, 120, bytes32(uint256(2)));
        assert(a == uint128(uint256(LIQUIDITY)) && b == a);

        runSwap(first, false, -int256(BUDGET * 2), TickMath.getSqrtPriceAtTick(121), "");
        (, int24 tick,,) = manager.getSlot0(first.toId());
        assert(tick == 121 && manager.getLiquidity(first.toId()) == uint128(uint256(LIQUIDITY / 2)));
    }

    function testHookRejectsReturnFlagWithoutCallbackFlag() public {
        PoolKey memory invalid = first;
        invalid.hooks = IHooks(address(0x08)); // beforeSwap returns Delta, but no beforeSwap callback bit
        try manager.initialize(invalid, Q96) returns (int24) {
            revert("expected HookAddressNotValid");
        } catch (bytes memory reason) {
            assert(bytes4(reason) == bytes4(keccak256("HookAddressNotValid(address)")));
        }
    }

    function testFeeOverrideIsLocalToOneSwap() public {
        PoolKey memory dynamicKey = first;
        address flaggedHook = address(0x80); // beforeSwap, no returns-Delta permission
        // Local lab only: place runtime at a flagged address without a CREATE2 search.
        vm.etch(flaggedHook, address(new TutorialFeeHook(manager)).code);
        dynamicKey.hooks = IHooks(flaggedHook);
        dynamicKey.fee = LPFeeLibrary.DYNAMIC_FEE_FLAG;
        manager.initialize(dynamicKey, Q96);
        (,,, uint24 initial) = manager.getSlot0(dynamicKey.toId());
        assert(initial == 0);
        TutorialFeeHook(flaggedHook).setStoredFee(dynamicKey, STATIC_FEE);
        addLiquidity(dynamicKey, -120, 120, LIQUIDITY, bytes32(uint256(1)));

        uint160 limit = TickMath.getSqrtPriceAtTick(-119);
        BalanceDelta standard = runSwap(first, true, -int256(BUDGET / 4), limit, "");
        BalanceDelta expensive = runSwap(dynamicKey, true, -int256(BUDGET / 4), limit, abi.encode(OVERRIDE_FEE));
        assert(standard.amount0() == expensive.amount0());
        assert(standard.amount1() > expensive.amount1());
        (,,, uint24 stored) = manager.getSlot0(dynamicKey.toId());
        assert(stored == STATIC_FEE);
    }

    function testFeeRejectsExactOutputAtOneHundredPercent() public {
        PoolKey memory fullFee = first;
        fullFee.fee = 1_000_000;
        manager.initialize(fullFee, Q96);
        addLiquidity(fullFee, -120, 120, LIQUIDITY, bytes32(uint256(1)));
        SwapParams memory params = SwapParams(true, 1_000, TickMath.getSqrtPriceAtTick(-119));
        bytes memory swapData = abi.encode(fullFee, params, bytes(""));
        try manager.unlock(abi.encode(Operation.Swap, swapData)) returns (bytes memory) {
            revert("expected InvalidFeeForExactOut");
        } catch (bytes memory reason) {
            assert(bytes4(reason) == Pool.InvalidFeeForExactOut.selector);
        }
    }

    function testSettlementNetsTheIntermediateCurrency() public {
        Currency middle = first.currency1;
        uint256 beforeBalance = MockERC20(Currency.unwrap(middle)).balanceOf(address(this));
        int128 credit =
            abi.decode(manager.unlock(abi.encode(Operation.TwoHops, abi.encode(Settlement.Normal))), (int128));
        assert(credit > 0);
        assert(beforeBalance == MockERC20(Currency.unwrap(middle)).balanceOf(address(this)));
        assert(!manager.isUnlocked());
    }

    function testSettlementRollsBackAllIncompleteVariants() public {
        (uint160 beforePrice,,,) = manager.getSlot0(first.toId());
        for (uint256 mode = 1; mode <= uint256(Settlement.WrongAccount); ++mode) {
            try manager.unlock(abi.encode(Operation.TwoHops, abi.encode(Settlement(mode)))) returns (bytes memory) {
                revert("expected CurrencyNotSettled");
            } catch (bytes memory reason) {
                assert(bytes4(reason) == IPoolManager.CurrencyNotSettled.selector);
            }
            (uint160 afterPrice,,,) = manager.getSlot0(first.toId());
            assert(beforePrice == afterPrice);
            assert(!manager.isUnlocked());
        }
    }

    function unlockCallback(bytes calldata raw) external returns (bytes memory) {
        require(msg.sender == address(manager));
        (Operation operation, bytes memory args) = abi.decode(raw, (Operation, bytes));
        if (operation == Operation.Liquidity) {
            (PoolKey memory key, ModifyLiquidityParams memory params) =
                abi.decode(args, (PoolKey, ModifyLiquidityParams));
            (BalanceDelta delta,) = manager.modifyLiquidity(key, params, "");
            reconcile(key.currency0, delta.amount0());
            reconcile(key.currency1, delta.amount1());
            return "";
        }
        if (operation == Operation.Swap) {
            (PoolKey memory key, SwapParams memory params, bytes memory hookData) =
                abi.decode(args, (PoolKey, SwapParams, bytes));
            BalanceDelta delta = manager.swap(key, params, hookData);
            reconcile(key.currency0, delta.amount0());
            reconcile(key.currency1, delta.amount1());
            return abi.encode(delta);
        }

        Settlement mode = abi.decode(args, (Settlement));
        uint160 limit = TickMath.getSqrtPriceAtTick(-119);
        BalanceDelta deltaAB = manager.swap(first, SwapParams(true, -int256(BUDGET / 4), limit), "");
        BalanceDelta deltaBC = manager.swap(second, SwapParams(true, -int256(deltaAB.amount1()), limit), "");
        assert(deltaAB.amount1() + deltaBC.amount0() == 0);
        assert(manager.currencyDelta(address(this), first.currency1) == 0);
        assert(manager.getNonzeroDeltaCount() == 2);

        if (mode == Settlement.WrongAccount) {
            pay(first.currency0, uint128(-deltaAB.amount0()), address(0xf00));
        } else if (mode != Settlement.SkipPayment) {
            reconcile(first.currency0, deltaAB.amount0());
        }
        if (mode != Settlement.SkipTake) reconcile(second.currency1, deltaBC.amount1());

        uint256 expected = mode == Settlement.Normal ? 0 : mode == Settlement.WrongAccount ? 2 : 1;
        assert(manager.getNonzeroDeltaCount() == expected);
        return abi.encode(deltaBC.amount1());
    }

    function addLiquidity(PoolKey memory key, int24 lower, int24 upper, int256 amount, bytes32 salt) internal {
        ModifyLiquidityParams memory params = ModifyLiquidityParams(lower, upper, amount, salt);
        manager.unlock(abi.encode(Operation.Liquidity, abi.encode(key, params)));
    }

    function runSwap(PoolKey memory key, bool zeroForOne, int256 amount, uint160 limit, bytes memory hookData)
        internal
        returns (BalanceDelta)
    {
        SwapParams memory params = SwapParams(zeroForOne, amount, limit);
        return abi.decode(manager.unlock(abi.encode(Operation.Swap, abi.encode(key, params, hookData))), (BalanceDelta));
    }

    function reconcile(Currency currency, int128 delta) internal {
        if (delta < 0) {
            pay(currency, uint256(-int256(delta)), address(this));
        } else if (delta > 0) {
            manager.take(currency, address(this), uint128(delta));
        }
    }

    function pay(Currency currency, uint256 amount, address account) internal {
        manager.sync(currency);
        assert(MockERC20(Currency.unwrap(currency)).transfer(address(manager), amount));
        if (account == address(this)) assert(manager.settle() == amount);
        else assert(manager.settleFor(account) == amount);
    }
}
