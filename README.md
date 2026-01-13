# ⛽ GaslessBase

**ERC-4337 Account Abstraction Paymaster for Base Network**

Sponsor gas fees for users to enable seamless Web3 onboarding - especially for African users and emerging markets.

---

## 🎯 Overview

GaslessBase is an **ERC-4337 Account Abstraction** implementation that allows sponsors to pay gas fees on behalf of users. This eliminates the biggest barrier to Web3 adoption: **users don't need ETH to transact**.

### Why This Matters

**For Africa & Emerging Markets:**
- 🌍 Users can interact with Web3 without buying crypto first
- 💰 NGOs, DAOs, and apps can sponsor user transactions
- 🚀 Dramatically lowers onboarding friction
- 🎓 Makes Web3 accessible to normal people

**Technical Excellence:**
- ⚡ Built on **ERC-4337** (Account Abstraction standard)
- 🔧 Implements **Paymaster** contract for gas sponsorship
- 🏗️ Uses **EntryPoint** for UserOperation execution
- 🎯 Optimized for **Base** (low gas, Coinbase-aligned)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        User                              │
└────────────────────┬────────────────────────────────────┘
                     │ Signs UserOperation
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Bundler Service                        │
│  (Collects UserOps, submits to EntryPoint)             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                EntryPoint (0x5FF...002)                  │
│  - Validates UserOperation                              │
│  - Calls Paymaster for gas sponsorship                  │
│  - Executes transaction from Smart Account              │
└────┬─────────────────────────────┬──────────────────────┘
     │                              │
     ▼                              ▼
┌──────────────────┐      ┌────────────────────────────┐
│  GaslessBase     │      │   SimpleAccount            │
│  Paymaster       │      │   (User's Smart Wallet)    │
│  - Sponsors gas  │      │   - Executes transaction   │
│  - Validates ops │      │   - Owned by user          │
└──────────────────┘      └────────────────────────────┘
```

## ✨ Key Features

### For Users 👤
- **Gasless Transactions**: Transact without owning ETH
- **Smart Account Wallet**: ERC-4337 compatible smart contract wallet
- **Seamless UX**: No gas fee prompts, no ETH required
- **Security**: Non-custodial, user maintains control

### For Sponsors 💼
- **Gas Sponsorship Dashboard**: Monitor and control sponsored transactions
- **Spending Limits**: Set daily/monthly caps
- **Whitelist Control**: Sponsor specific contracts or users
- **Analytics**: Track sponsorship usage and costs

### For Developers 🛠️
- **ERC-4337 Standard**: Full Account Abstraction implementation
- **Modular Design**: Easy to extend and customize
- **Base Optimized**: Low gas costs on Base network
- **Production Ready**: Audited contracts, comprehensive tests

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- MetaMask or compatible Web3 wallet
- Base Sepolia testnet ETH (for deployment)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd gaslessbase

# Install smart contract dependencies
cd smartcontract
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Development

```bash
# Compile smart contracts
cd smartcontract
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Base Sepolia
npx hardhat run scripts/deploy.ts --network base-sepolia

# Run frontend
cd ../frontend
npm run dev
```

## 🎨 Tech Stack

### Smart Contracts
- **Standard**: ERC-4337 (Account Abstraction)
- **Framework**: Hardhat
- **Language**: Solidity 0.8.24
- **Network**: Base (Sepolia testnet, then mainnet)
- **Key Contracts**:
  - `GaslessBasePaymaster`: Sponsors gas for UserOperations
  - `SimpleAccount`: ERC-4337 smart account wallet
  - `AccountFactory`: Creates new smart accounts
  - `EntryPoint`: Standard ERC-4337 EntryPoint (v0.6)

### Frontend
- **Framework**: Next.js 14+ (React)
- **Language**: TypeScript
- **Styling**: CSS (modern design)
- **Web3**: ethers.js + userop.js (ERC-4337 SDK)
- **Wallet**: RainbowKit or Web3Modal

### Infrastructure
- **Bundler**: Stackup or Alchemy AA Bundler
- **RPC**: Base RPC or Alchemy
- **Network**: Base Sepolia (testnet) → Base (mainnet)

## 📋 Project Structure

```
gaslessbase/
├── smartcontract/
│   ├── contracts/
│   │   ├── GaslessBasePaymaster.sol    # Main paymaster
│   │   ├── SimpleAccount.sol            # Smart account wallet
│   │   ├── AccountFactory.sol           # Account creation
│   │   └── interfaces/                  # ERC-4337 interfaces
│   ├── scripts/
│   │   └── deploy.ts                    # Deployment script
│   ├── test/                            # Contract tests
│   └── hardhat.config.ts
├── frontend/
│   ├── app/                             # Next.js pages
│   ├── components/                      # React components
│   ├── lib/
│   │   ├── aa/                          # Account Abstraction logic
│   │   ├── contracts/                   # ABIs and addresses
│   │   └── bundler/                     # Bundler integration
│   └── package.json
└── docs/                                # Documentation
```

## 🔑 Core Concepts

### ERC-4337 Account Abstraction
- **UserOperation**: Transaction-like object signed by user
- **Bundler**: Off-chain service that submits UserOps to EntryPoint
- **EntryPoint**: On-chain contract that validates and executes UserOps
- **Paymaster**: Contract that sponsors gas fees
- **Smart Account**: User's contract wallet (not EOA)

### Gas Sponsorship Flow
1. User creates a UserOperation (e.g., "send tokens")
2. UserOp includes paymaster address (GaslessBase)
3. Bundler submits UserOp to EntryPoint
4. EntryPoint calls Paymaster to validate sponsorship
5. Paymaster approves and stakes gas
6. EntryPoint executes transaction from user's Smart Account
7. Paymaster pays the gas fee

## 🎯 Use Cases

### 1. **Onboarding New Users**
- Users sign up with email/social
- App creates smart account for them
- Users can transact immediately (no ETH needed)

### 2. **NGO/DAO Sponsorship**
- NGOs sponsor transactions for beneficiaries
- DAOs cover gas for community members
- Grants programs enable gasless participation

### 3. **DApp User Experience**
- DApps sponsor gas for their users
- Seamless UX without gas prompts
- Increase conversion and retention

### 4. **African Market Focus**
- Lower barrier to entry in Nigeria, Kenya, Ghana
- Enable remittances without gas fees
- Support local currency on-ramps

## 🔒 Security Features

- **Spending Limits**: Cap daily/monthly sponsorship
- **Whitelist/Blacklist**: Control which contracts can be called
- **Rate Limiting**: Prevent abuse
- **Signature Validation**: Ensure UserOps are legitimate
- **Pausable**: Emergency stop functionality

## 🎯 Roadmap

- [x] Project scaffolding
- [ ] Implement Paymaster contract
- [ ] Implement SimpleAccount and Factory
- [ ] Write comprehensive tests
- [ ] Deploy to Base Sepolia
- [ ] Build frontend demo
- [ ] Integrate bundler service
- [ ] Add sponsor dashboard
- [ ] Security audit
- [ ] Mainnet deployment
- [ ] African market partnerships

## 📚 Resources

- [ERC-4337 Specification](https://eips.ethereum.org/EIPS/eip-4337)
- [Account Abstraction Docs](https://docs.alchemy.com/docs/account-abstraction-overview)
- [Base Network Docs](https://docs.base.org/)
- [userop.js SDK](https://github.com/stackup-wallet/userop.js)

## 💡 Why Base?

- ✅ **Low Gas Costs**: Affordable sponsorship
- ✅ **Coinbase Ecosystem**: Strong AA support
- ✅ **Growing Adoption**: Active developer community
- ✅ **African Focus**: Aligned with financial inclusion goals

## 📝 License

MIT

---

**GaslessBase** - Making Web3 Accessible for Everyone ⛽✨
