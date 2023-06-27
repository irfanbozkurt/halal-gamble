import { Lottery } from "../typechain-types";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Lottery", function () {
  let lottery: Lottery;
  before(async () => {
    const [owner] = await ethers.getSigners();
    const lotteryFactory = await ethers.getContractFactory("Lottery");
    lottery = (await lotteryFactory.deploy(owner.address)) as Lottery;
    await lottery.deployed();
  });

  describe("Deployment", function () {
    it("Should have the right message on deploy", async function () {});
  });
});
