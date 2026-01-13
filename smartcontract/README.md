# GaslessBase Smart Contracts

ERC-4337 Account Abstraction contracts for gas sponsorship on Base.

## 📋 Contracts

### Core Contracts

#### 1. GaslessBasePaymaster.sol
Main paymaster contract that sponsors gas fees for UserOperations.

**Features:**
- ✅ Spending limits (daily, monthly, per-user)
- ✅ Whitelist/blacklist functionality
- ✅ Pausable for emergencies
- ✅ Analytics tracking
- ✅ Owner controls

#### 2. SimpleAccount.sol
ERC-4337 smart contract wallet for users.

**Features:**
- ✅ Owner-controlled (EOA or contract)
- ✅ Execute single or batch transactions
- ✅ Signature validation
- ✅ EntryPoint integration

#### 3. SimpleAccountFactory.sol
Factory for creating SimpleAccount instances with CREATE2.

**Features:**
- ✅ Deterministic addresses
- ✅ Counterfactual deployment
- ✅ Gas-efficient creation

## 🚀 Getting Started

### Install Dependencies

```bash
npm install
```

### Compile Contracts

```bash
npx hardhat compile
```

### Run Tests

```bash
npx hardhat test
```

### Deploy to Base Sepolia

```bash
# Set environment variables in .env
PRIVATE_KEY=your_private_key
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_basescan_api_key

# Deploy
npx hardhat run scripts/deploy.ts --network base-sepolia
```

## 🔑 Key Concepts

### ERC-4337 Flow

1. **User** creates and signs a `UserOperation`
2. **Bundler** submits UserOp to `EntryPoint`
3. **EntryPoint** validates with `Paymaster`
4. **Paymaster** approves and sponsors gas
5. **EntryPoint** executes from `SimpleAccount`
6. **Paymaster** pays the gas fee

### Paymaster Validation

The paymaster checks:
- ✅ Not paused
- ✅ User not blacklisted
- ✅ User/contract whitelisted (if enabled)
- ✅ Daily spending limit not exceeded
- ✅ Monthly spending limit not exceeded
- ✅ Per-user limit not exceeded

## 📝 Usage Examples

### Deploy a Smart Account

```typescript
const factory = await ethers.getContractAt("SimpleAccountFactory", factoryAddress);
const salt = 0;
await factory.createAccount(ownerAddress, salt);
const accountAddress = await factory.getAddress(ownerAddress, salt);
```

### Sponsor Gas for a User

```typescript
const paymaster = await ethers.getContractAt("GaslessBasePaymaster", paymasterAddress);

// Whitelist user
await paymaster.setUserWhitelist(userAddress, true);

// Fund paymaster
await paymaster.deposit({ value: ethers.parseEther("1.0") });

// Add stake (required by EntryPoint)
await paymaster.addStake(86400, { value: ethers.parseEther("0.5") });
```

### Create a UserOperation

```typescript
const userOp = {
  sender: accountAddress,
  nonce: await entryPoint.getNonce(accountAddress, 0),
  initCode: "0x",
  callData: account.interface.encodeFunctionData("execute", [
    targetAddress,
    value,
    data
  ]),
  callGasLimit: 100000,
  verificationGasLimit: 100000,
  preVerificationGas: 21000,
  maxFeePerGas: await ethers.provider.getFeeData().maxFeePerGas,
  maxPriorityFeePerGas: await ethers.provider.getFeeData().maxPriorityFeePerGas,
  paymasterAndData: paymasterAddress, // Paymaster sponsors gas
  signature: "0x" // Sign with owner's private key
};
```

## 🔒 Security Features

### Spending Limits
- **Daily Limit**: Cap spending per day
- **Monthly Limit**: Cap spending per month
- **Per-User Limit**: Cap spending per user

### Access Control
- **Whitelist**: Only sponsor approved users/contracts
- **Blacklist**: Block malicious users
- **Pausable**: Emergency stop

### Staking
- Paymaster must stake ETH in EntryPoint
- Prevents spam and ensures accountability

## 🧪 Testing

Run the full test suite:

```bash
npx hardhat test
```

Test specific contracts:

```bash
npx hardhat test test/GaslessBasePaymaster.test.ts
npx hardhat test test/SimpleAccount.test.ts
```

Gas report:

```bash
REPORT_GAS=true npx hardhat test
```

## 📊 Contract Addresses

### Base Sepolia Testnet
- **EntryPoint**: `0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789` (standard)
- **AccountFactory**: (deploy and update)
- **Paymaster**: (deploy and update)

### Base Mainnet
- **EntryPoint**: `0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789` (standard)
- **AccountFactory**: (deploy and update)
- **Paymaster**: (deploy and update)

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
PRIVATE_KEY=your_private_key_here
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_RPC_URL=https://mainnet.base.org
BASESCAN_API_KEY=your_basescan_api_key
```

### Paymaster Settings

```solidity
// Update spending limits
paymaster.setSpendingLimits(
  0.5 ether,  // daily
  5 ether,    // monthly
  0.05 ether  // per user
);

// Enable whitelist
paymaster.setUseWhitelist(true);

// Whitelist a contract
paymaster.setContractWhitelist(dappAddress, true);
```

## 📚 Resources

- [ERC-4337 Specification](https://eips.ethereum.org/EIPS/eip-4337)
- [Account Abstraction Docs](https://docs.alchemy.com/docs/account-abstraction-overview)
- [Base Docs](https://docs.base.org/)
- [EntryPoint Contract](https://github.com/eth-infinitism/account-abstraction)

## 🐛 Known Issues

None currently. Report issues on GitHub.

## 📄 License

MIT
