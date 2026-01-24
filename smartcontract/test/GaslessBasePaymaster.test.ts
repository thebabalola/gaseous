import { expect } from "chai";
import { ethers } from "hardhat";
import { GaslessBasePaymaster, EntryPoint } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("GaslessBasePaymaster", function () {
  let paymaster: GaslessBasePaymaster;
  let entryPoint: EntryPoint;
  let owner: SignerWithAddress;
  let sponsor: SignerWithAddress;
  let user: SignerWithAddress;
  let otherContract: SignerWithAddress;

  beforeEach(async function () {
    [owner, sponsor, user, otherContract] = await ethers.getSigners();

    const EntryPointFactory = await ethers.getContractFactory("MockEntryPoint");
    entryPoint = (await EntryPointFactory.deploy()) as any;

    const PaymasterFactory = await ethers.getContractFactory("GaslessBasePaymaster");
    paymaster = await PaymasterFactory.deploy(await entryPoint.getAddress(), owner.address);

    // Deposit some ETH for the paymaster
    await paymaster.deposit({ value: ethers.parseEther("1.0") });
  });

  describe("Initialization", function () {
    it("Should set the correct owner", async function () {
      expect(await paymaster.owner()).to.equal(owner.address);
    });

    it("Should set default spending limits", async function () {
      expect(await paymaster.dailySpendingLimit()).to.equal(ethers.parseEther("0.1"));
      expect(await paymaster.monthlySpendingLimit()).to.equal(ethers.parseEther("1"));
      expect(await paymaster.perUserLimit()).to.equal(ethers.parseEther("0.01"));
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update spending limits", async function () {
      const newDaily = ethers.parseEther("0.5");
      const newMonthly = ethers.parseEther("5");
      const newUser = ethers.parseEther("0.1");

      await expect(paymaster.setSpendingLimits(newDaily, newMonthly, newUser))
        .to.emit(paymaster, "SpendingLimitUpdated")
        .withArgs(newDaily, newMonthly, newUser);

      expect(await paymaster.dailySpendingLimit()).to.equal(newDaily);
      expect(await paymaster.monthlySpendingLimit()).to.equal(newMonthly);
      expect(await paymaster.perUserLimit()).to.equal(newUser);
    });

    it("Should fail if non-owner tries to update spending limits", async function () {
      await expect(paymaster.connect(user).setSpendingLimits(0, 0, 0))
        .to.be.revertedWithCustomError(paymaster, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to whitelist a contract", async function () {
      await expect(paymaster.setContractWhitelist(otherContract.address, true))
        .to.emit(paymaster, "ContractWhitelisted")
        .withArgs(otherContract.address, true);
      
      expect(await paymaster.whitelistedContracts(otherContract.address)).to.be.true;
    });

    it("Should allow owner to blacklist a user", async function () {
      await expect(paymaster.setUserBlacklist(user.address, true))
        .to.emit(paymaster, "UserBlacklisted")
        .withArgs(user.address, true);
      
      expect(await paymaster.blacklistedUsers(user.address)).to.be.true;
    });
  });

  describe("Sponsorship Logic (canSponsor)", function () {
    it("Should return true for a valid sponsorship within limits", async function () {
      expect(await paymaster.canSponsor(user.address, ethers.parseEther("0.001"))).to.be.true;
    });

    it("Should return false if paymaster is paused", async function () {
      await paymaster.setPaused(true);
      expect(await paymaster.canSponsor(user.address, ethers.parseEther("0.001"))).to.be.false;
    });

    it("Should return false if user is blacklisted", async function () {
      await paymaster.setUserBlacklist(user.address, true);
      expect(await paymaster.canSponsor(user.address, ethers.parseEther("0.001"))).to.be.false;
    });

    it("Should return false if user is not whitelisted and whitelist is enabled", async function () {
      await paymaster.setUseWhitelist(true);
      expect(await paymaster.canSponsor(user.address, ethers.parseEther("0.001"))).to.be.false;
      
      await paymaster.setUserWhitelist(user.address, true);
      expect(await paymaster.canSponsor(user.address, ethers.parseEther("0.001"))).to.be.true;
    });

    it("Should return false if daily limit is exceeded", async function () {
      // Set daily limit very low
      await paymaster.setSpendingLimits(ethers.parseEther("0.001"), ethers.parseEther("1"), ethers.parseEther("1"));
      // Check for an amount higher than the daily limit
      expect(await paymaster.canSponsor(user.address, ethers.parseEther("0.002"))).to.be.false;
    });

    it("Should return false if per-user limit is exceeded", async function () {
      // Set per-user limit low
      await paymaster.setSpendingLimits(ethers.parseEther("1"), ethers.parseEther("1"), ethers.parseEther("0.005"));
      expect(await paymaster.canSponsor(user.address, ethers.parseEther("0.006"))).to.be.false;
    });
  });
});
