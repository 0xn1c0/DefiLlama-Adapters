const { stakingPricedLP } = require("../helper/staking");
const sdk = require("@defillama/sdk")
const { pool2 } = require("../helper/pool2");
const {sumLPWithOnlyOneToken} = require("../helper/unwrapLPs.js");

const MasterchefV2 = "0xeced26633b5c2d7124b5eae794c9c32a8b8e7df2";
const NUT_TokenAddress = "0xfe197e7968807b311d476915db585831b43a7e3b";
const XCFX_TokenAddress = "0x889138644274a7dc602f25a7e7d53ff40e6d0091";

const CFX_NUT_LP_TokenAddress = "0xd9d5748cb36a81fe58f91844f4a0412502fd3105";
const CFX_XCFX_LP_TokenAddress = "0x949b78ef2c8d6979098e195b08f27ff99cb20448";

const WCFX = "0x14b2d3bc65e74dae1030eafd8ac30c533c976a9b";

const chain = 'conflux';

function xcfxSupply(target) {
    return async (timestamp, block, chainBlocks) => {
        let supply = {};
        supply = { everscale: (await sdk.api.abi.call({
          target,
            abi: 'erc20:totalSupply',
            block: chainBlocks[chain],
            chain
        })).output / 10 ** 17 };

        return supply ;
    };
  }


function nut_cfx_pool(chain = "ethereum", transformAddress = (addr) => addr) {
    return async (_timestamp, _ethBlock, chainBlocks) => {
        let balances = {};
        await sumLPWithOnlyOneToken(balances, CFX_NUT_LP_TokenAddress,MasterchefV2, WCFX, undefined, chain, transformAddress);
        balances['wrapped-conflux'] = Number(balances['wrapped-conflux'])/(10 ** 18);
        return balances;
    }
  }


function xcfx_cfx_pool(chain = "ethereum", transformAddress = (addr) => addr) {
    return async (_timestamp, _ethBlock, chainBlocks) => {
        let balances = {};
        await sumLPWithOnlyOneToken(balances, CFX_XCFX_LP_TokenAddress,MasterchefV2, WCFX, undefined, chain, transformAddress);
        balances['wrapped-conflux'] = Number(balances['wrapped-conflux'])/(10 ** 18);
        return balances;
    }
  }

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL accounts for XCFX Supply. Staking gets the amount of CFX-XCFX LPs Staked. Pool2 refers to the CFX-NUT LPs staked in the Masterchef Contract',
  conflux: {
    tvl: xcfxSupply(XCFX_TokenAddress, "conflux", () => "wrapped-conflux"),
    staking: xcfx_cfx_pool("conflux", () => "wrapped-conflux"),
    pool2: nut_cfx_pool("conflux", () => "wrapped-conflux"),
  },
}
