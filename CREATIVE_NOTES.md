# 创作笔记

## 项目名称

**控签台**（Control Sign Desk）

## 中文名简介

控签台是一个极简自托管交易控制台，让用户完整掌控从钱包创建到交易上链的每一步。通过深度集成 Token Core 实现浏览器端密钥管理，结合 Security Handbook 材料构建多维度安全审查，最终将交易真实广播到 Sepolia 测试网。

## 英文名简介

Control Sign Desk is a minimalist self-custody transaction console that gives users complete control over every step from wallet creation to on-chain transaction. It deeply integrates Token Core for browser-side key management, combines Security Handbook materials for multi-dimensional security auditing, and broadcasts transactions to the Sepolia testnet.

## 创作理念

### 核心主题：安全与自托管

控签台的核心设计理念是「你的钱包你掌控」。在整个创作过程中，我们始终围绕这个主题：

1. **自托管优先**：所有密钥操作（创建、导入、签名）都通过 Token Core WASM 在浏览器本地完成，密钥数据永不离开用户设备。这体现了非托管钱包的核心价值——去中心化意味着用户自己掌控资产。

2. **安全审查深度集成**：我们不仅实现了基本的安全检查，还深度引用了 Security Handbook 中的安全规则。每一项检查都标注了对应的 Handbook 章节，让用户理解为什么某个操作是危险的，而不仅仅是告知风险等级。

3. **完整流程可视化**：从钱包创建到交易上链，每一步都有清晰的界面和状态反馈。用户可以看到助记词、签名数据、交易哈希——所有关键信息都是透明的。

### 技术选择

- **Token Core WASM**：选择 Token Core 的 WASM 版本，是因为它可以在浏览器端运行，无需后端服务器。这完美契合了自托管的理念。
- **ethers.js v6**：用于与 Sepolia 测试网交互，提供可靠的交易广播能力。
- **Tailwind CSS 4**：深色控制台风格，专业、清晰、科技感强。
- **Vite + React + TypeScript**：现代化前端技术栈，开发体验好，构建速度快。

### 视觉风格

深色专业控制台风格，灵感来自专业交易终端和安全运营中心。使用蓝色和青色作为主色调，传达信任和安全感。每个操作步骤都有清晰的视觉反馈，确保用户始终知道当前状态。

## 安全声明

⚠️ 此为演示项目，仅供 Sepolia 测试网使用，请勿用于真实资产。

- 钱包创建和导入全程本地处理（Token Core WASM）
- 所有签名操作在浏览器端完成
- 深度集成 Security Handbook 安全审查规则
- 明确标注测试网标识和安全警告

## 参考材料

- Token Core: https://github.com/consenlabs/token-core-monorepo (tenth-anniversary 分支, tcx-wasm 模块)
- Token UI: https://github.com/consenlabs/token-ui (设计系统参考)
- Security: https://github.com/consenlabs/token-ui/tree/main/security (wallet-security-handbook.md)
