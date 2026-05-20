# 控签台 Control Sign Desk

> 极简自托管交易控制台 · 完整掌控从钱包创建到交易上链的每一步

## 🎯 项目简介

**控签台**（Control Sign Desk）是一个专业、清晰的极简自托管交易控制台，为 imToken 10 周年 AI 共创活动打造。用户可以在这里完整掌控从钱包创建到交易上链的每一步，强烈体现「你的钱包你掌控」。

### 核心特性

- 🔐 **自托管钱包**：通过 Token Core WASM 在浏览器本地创建/导入钱包，密钥永不离开设备
- 🤖 **意图输入**：支持自然语言描述交易意图，AI 本地解析为交易参数
- 🛡️ **深度安全审查**：多维度安全检查，深度集成 Security Handbook 材料
- ✍️ **Token Core 签名**：使用 Token Core 进行自托管签名，完全掌控签名过程
- 📡 **Sepolia 真实广播**：交易真实广播到 Sepolia 测试网，显示 tx hash 和区块链浏览器链接
- 📊 **操作历史 + 安全评分**：完整记录每一步操作，实时安全评分

## 🏗️ 技术架构

```
Vite + React 19 + TypeScript
├── Token Core WASM (@consenlabs/tcx-wasm) - 钱包创建、签名
├── ethers.js v6 - Sepolia 测试网交互
├── Tailwind CSS 4 - 深色控制台视觉风格
└── Lucide React - 图标系统
```

## 🚀 本地运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 📋 完整测试网流程

1. **创建新钱包** → Token Core WASM 生成助记词 + Keystore
2. **备份助记词** → 安全提醒 + 确认机制
3. **导入钱包** → 支持助记词 / Keystore 导入
4. **意图输入** → 自然语言描述或手动构建交易
5. **安全审查** → 多维度检查，引用 Security Handbook
6. **Token Core 签名** → 自托管签名，密钥不离开浏览器
7. **Sepolia 广播** → 真实广播到测试网，显示 tx hash + Etherscan 链接

## 🔒 安全声明

- ⚠️ **此为演示项目，仅供 Sepolia 测试网使用，请勿用于真实资产**
- 钱包创建和导入全程本地处理（Token Core WASM）
- 所有签名操作在浏览器端完成
- 深度集成 Security Handbook 安全审查
- 明确标注测试网标识

## 📦 官方材料使用

- **Token Core**: `@consenlabs/tcx-wasm` - 钱包创建、账户派生、交易签名
- **Token UI**: 参考设计系统（色彩、组件风格、交互模式）
- **Security**: 深度集成 `wallet-security-handbook.md` 安全审查规则

## 🎬 演示视频脚本

见 [DEMO_SCRIPT.md](./DEMO_SCRIPT.md)

## 📝 创作笔记

见 [CREATIVE_NOTES.md](./CREATIVE_NOTES.md)

## ☁️ Vercel 部署

1. Fork 本仓库
2. 在 Vercel 中导入项目
3. Framework Preset 选择 **Vite**
4. 点击 Deploy
5. 部署完成后访问生成的 URL

---

**Powered by Token Core · Token UI · Security Handbook**
