import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Deploying GaslessBase contracts to Base Sepolia...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

    // EntryPoint address on Base Sepolia (standard ERC-4337 v0.6)
    const ENTRYPOINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
    console.log("Using EntryPoint at:", ENTRYPOINT_ADDRESS, "\n");

    // 1. Deploy SimpleAccountFactory
    console.log("📦 Deploying SimpleAccountFactory...");
    const SimpleAccountFactory = await ethers.getContractFactory("SimpleAccountFactory");
    const accountFactory = await SimpleAccountFactory.deploy(ENTRYPOINT_ADDRESS);
    await accountFactory.waitForDeployment();
    const factoryAddress = await accountFactory.getAddress();
    console.log("✅ SimpleAccountFactory deployed to:", factoryAddress, "\n");

    // 2. Deploy GaslessBasePaymaster
    console.log("⛽ Deploying GaslessBasePaymaster...");
    const GaslessBasePaymaster = await ethers.getContractFactory("GaslessBasePaymaster");
    const paymaster = await GaslessBasePaymaster.deploy(
        ENTRYPOINT_ADDRESS,
        deployer.address // owner
    );
    await paymaster.waitForDeployment();
    const paymasterAddress = await paymaster.getAddress();
    console.log("✅ GaslessBasePaymaster deployed to:", paymasterAddress, "\n");

    // 3. Fund the paymaster
    console.log("💰 Funding paymaster with 0.1 ETH...");
    const depositTx = await paymaster.deposit({ value: ethers.parseEther("0.1") });
    await depositTx.wait();
    console.log("✅ Paymaster funded\n");

    // 4. Add stake to paymaster (required by EntryPoint)
    console.log("🔒 Adding stake to paymaster...");
    const stakeTx = await paymaster.addStake(86400, { value: ethers.parseEther("0.05") }); // 1 day unstake delay
    await stakeTx.wait();
    console.log("✅ Stake added\n");

    // 5. Create a test account
    console.log("👤 Creating test smart account...");
    const salt = 0;
    const createAccountTx = await accountFactory.createAccount(deployer.address, salt);
    await createAccountTx.wait();
    const accountAddress = await accountFactory.getAddress(deployer.address, salt);
    console.log("✅ Test account created at:", accountAddress, "\n");

    // Summary
    console.log("=".repeat(60));
    console.log("🎉 Deployment Complete!");
    console.log("=".repeat(60));
    console.log("EntryPoint:           ", ENTRYPOINT_ADDRESS);
    console.log("AccountFactory:       ", factoryAddress);
    console.log("Paymaster:            ", paymasterAddress);
    console.log("Test Smart Account:   ", accountAddress);
    console.log("=".repeat(60));
    console.log("\n📝 Next steps:");
    console.log("1. Update frontend with contract addresses");
    console.log("2. Configure paymaster spending limits");
    console.log("3. Test gasless transactions");
    console.log("4. Verify contracts on BaseScan");
    console.log("\nVerify with:");
    console.log(`npx hardhat verify --network base-sepolia ${factoryAddress} ${ENTRYPOINT_ADDRESS}`);
    console.log(`npx hardhat verify --network base-sepolia ${paymasterAddress} ${ENTRYPOINT_ADDRESS} ${deployer.address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
