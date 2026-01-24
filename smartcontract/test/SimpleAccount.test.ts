import { expect } from "chai";
import { ethers } from "hardhat";
import { SimpleAccount, SimpleAccountFactory, MockEntryPoint } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("SimpleAccount", function () {
  let account: SimpleAccount;
  let factory: SimpleAccountFactory;
  let entryPoint: MockEntryPoint;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;
  let dest: SignerWithAddress;

  beforeEach(async function () {
    [owner, user, dest] = await ethers.getSigners();

    const EntryPointFactory = await ethers.getContractFactory("MockEntryPoint");
    entryPoint = (await EntryPointFactory.deploy()) as any;

    const SimpleAccountFactoryFactory = await ethers.getContractFactory("SimpleAccountFactory");
    factory = await SimpleAccountFactoryFactory.deploy(await entryPoint.getAddress());

    const tx = await factory.createAccount(owner.address, 0);
    const receipt = await tx.wait();
    const accountAddress = await factory.getAddress(owner.address, 0);
    account = await ethers.getContractAt("SimpleAccount", accountAddress);
  });

  describe("Initialization", function () {
    it("Should set the correct owner", async function () {
      expect(await account.owner()).to.equal(owner.address);
    });

    it("Should set the correct entry point", async function () {
      expect(await account.entryPoint()).to.equal(await entryPoint.getAddress());
    });
  });

  describe("Execution", function () {
    it("Should allow owner to execute a transaction", async function () {
      const value = ethers.parseEther("0.1");
      await owner.sendTransaction({ to: await account.getAddress(), value });

      const initialBalance = await ethers.provider.getBalance(dest.address);
      await account.connect(owner).execute(dest.address, value, "0x");
      const finalBalance = await ethers.provider.getBalance(dest.address);

      expect(finalBalance - initialBalance).to.equal(value);
    });

    it("Should fail if non-owner tries to execute", async function () {
      await expect(account.connect(user).execute(dest.address, 0, "0x"))
        .to.be.revertedWith("only owner");
    });
  });

  describe("Deposit", function () {
    it("Should allow adding deposit", async function () {
      const amount = ethers.parseEther("0.1");
      await account.addDeposit({ value: amount });
      expect(await account.getDeposit()).to.equal(amount);
    });
  });
});
describe("SimpleAccountFactory", function () {
  let factory: SimpleAccountFactory;
  let entryPoint: MockEntryPoint;
  let owner: SignerWithAddress;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    const EntryPointFactory = await ethers.getContractFactory("MockEntryPoint");
    entryPoint = (await EntryPointFactory.deploy()) as any;
    const FactoryFactory = await ethers.getContractFactory("SimpleAccountFactory");
    factory = await FactoryFactory.deploy(await entryPoint.getAddress());
  });

  it("Should create an account at a deterministic address", async function () {
    const salt = 123;
    const expectedAddress = await factory.getAddress(owner.address, salt);
    await factory.createAccount(owner.address, salt);
    const code = await ethers.provider.getCode(expectedAddress);
    expect(code).to.not.equal("0x");
  });
});
