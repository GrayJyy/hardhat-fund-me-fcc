const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")

describe("FundMe", async () => {
    // 测试前部署合约
    let fundMe
    let mockV3Aggregator
    let deployer
    const sendValue = ethers.utils.parseEther("1")
    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"]) // 部署所有tags带有all的deploy

        /**
         *
         * 另一种获取账户的方式
         * const accounts = ethers.getSigner()
         *  const fundMe = ethers.getContract("FundMe", accounts)
         */
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })
    describe("constructor", () => {
        it("Should sets aggregator address correctly", async () => {
            const priceFeed = await fundMe.getPriceFeed()
            assert.equal(priceFeed, mockV3Aggregator.address)
        })
    })
    describe("fund", function () {
        // https://ethereum-waffle.readthedocs.io/en/latest/matchers.html
        // could also do assert.fail
        it("Fails if you don't send enough ETH", async () => {
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })
        // we could be even more precise here by making sure exactly $50 works
        // but this is good enough for now
        it("Updates the amount funded data structure", async () => {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.getAddressToAmountFunded(deployer)
            assert.equal(response.toString(), sendValue.toString())
        })
    })
})
