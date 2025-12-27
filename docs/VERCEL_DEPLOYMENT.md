# 🚀 Vercel Frontend Deployment Guide

Deploy your MyL1 frontend services (Explorer, Wallet, Faucet) to Vercel after deploying the blockchain node to AWS.

## 📋 Prerequisites

- ✅ MyL1 blockchain node deployed to AWS
- ✅ Vercel account (free tier works)
- ✅ GitHub repository with frontend code
- ✅ AWS blockchain endpoints ready

## 🌐 Step 1: Get Your Blockchain Endpoints

After AWS deployment, you'll have endpoints like:
```
WebSocket: ws://12.34.56.78:9944
HTTP RPC:  http://12.34.56.78:9933
```

## 🏗️ Step 2: Deploy Explorer to Vercel

### Method 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy Explorer
cd explorer
vercel --prod

# Set environment variables when prompted:
# NEXT_PUBLIC_WS_ENDPOINT = ws://YOUR_AWS_IP:9944
# NEXT_PUBLIC_RPC_ENDPOINT = http://YOUR_AWS_IP:9933
# NEXT_PUBLIC_CHAIN_NAME = MyL1
```

### Method 2: GitHub Integration

1. **Connect GitHub to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `explorer` folder

2. **Configure Environment Variables**
   ```
   NEXT_PUBLIC_WS_ENDPOINT = ws://YOUR_AWS_IP:9944
   NEXT_PUBLIC_RPC_ENDPOINT = http://YOUR_AWS_IP:9933
   NEXT_PUBLIC_CHAIN_NAME = MyL1
   ```

3. **Deploy**
   - Click "Deploy"
   - Your explorer will be live at `https://your-project.vercel.app`

## 💰 Step 3: Deploy Wallet to Vercel

```bash
# Deploy Wallet
cd wallet
vercel --prod

# Environment variables:
# NEXT_PUBLIC_WS_ENDPOINT = ws://YOUR_AWS_IP:9944
# NEXT_PUBLIC_RPC_ENDPOINT = http://YOUR_AWS_IP:9933
# NEXT_PUBLIC_CHAIN_NAME = MyL1
```

## 🚰 Step 4: Deploy Faucet to Vercel

```bash
# Deploy Faucet
cd infra/faucet
vercel --prod

# Environment variables:
# WS_ENDPOINT = ws://YOUR_AWS_IP:9944
# FAUCET_MNEMONIC = your-faucet-wallet-mnemonic
# FAUCET_AMOUNT = 1000000000000000000
# FAUCET_COOLDOWN = 3600000
# FAUCET_MAX_BALANCE = 10000000000000000000000
```

## 🔧 Environment Variables Reference

### Explorer
```bash
NEXT_PUBLIC_WS_ENDPOINT=ws://YOUR_AWS_IP:9944
NEXT_PUBLIC_RPC_ENDPOINT=http://YOUR_AWS_IP:9933
NEXT_PUBLIC_CHAIN_NAME=MyL1
NEXT_PUBLIC_API_URL=https://your-api.vercel.app  # If you deploy API separately
```

### Wallet
```bash
NEXT_PUBLIC_WS_ENDPOINT=ws://YOUR_AWS_IP:9944
NEXT_PUBLIC_RPC_ENDPOINT=http://YOUR_AWS_IP:9933
NEXT_PUBLIC_CHAIN_NAME=MyL1
```

### Faucet
```bash
WS_ENDPOINT=ws://YOUR_AWS_IP:9944
RPC_ENDPOINT=http://YOUR_AWS_IP:9933
FAUCET_MNEMONIC=your-faucet-wallet-seed-phrase-here
FAUCET_AMOUNT=1000000000000000000
FAUCET_COOLDOWN=3600000
FAUCET_MAX_BALANCE=10000000000000000000000
```

## 🌍 Custom Domains (Optional)

### Add Custom Domain to Vercel
1. Go to your project settings in Vercel
2. Click "Domains"
3. Add your domain (e.g., `explorer.myl1.network`)
4. Configure DNS records as instructed

### Example Domain Setup
```
explorer.myl1.network → Vercel Explorer
wallet.myl1.network  → Vercel Wallet
faucet.myl1.network  → Vercel Faucet
api.myl1.network     → AWS API (if deployed)
```

## 📊 Monitoring & Analytics

### Vercel Analytics
- Built-in analytics in Vercel dashboard
- Real-time visitor stats
- Performance metrics

### Custom Monitoring
Add environment variables for monitoring:
```bash
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
SENTRY_DSN=your-sentry-dsn
```

## 🚀 Deployment Commands Summary

```bash
# Explorer
cd explorer && vercel --prod

# Wallet
cd wallet && vercel --prod

# Faucet
cd infra/faucet && vercel --prod
```

## 🔄 Updates & Redeployment

### Automatic Updates (Git Integration)
- Push to main branch → Auto-deploy

### Manual Updates
```bash
cd explorer && vercel --prod
```

## 🛠️ Troubleshooting

### Build Failures
```bash
# Check build logs in Vercel dashboard
# Common issues:
# - Missing environment variables
# - Node.js version mismatch
# - Build command errors
```

### Connection Issues
```bash
# Verify AWS endpoints are accessible
curl http://YOUR_AWS_IP:9933/health

# Check WebSocket connection
# Use browser dev tools or tools like wscat
```

### Environment Variables
```bash
# Never commit secrets to GitHub
# Use Vercel environment variables instead
# Test locally with .env.local first
```

## 💰 Vercel Pricing

- **Free Tier**: Perfect for development/testing
- **Pro**: $20/month for production features
- **Enterprise**: Custom pricing for large scale

## 🎯 Final URLs Structure

After deployment:
```
https://explorer.myl1.network    # Vercel Explorer
https://wallet.myl1.network     # Vercel Wallet
https://faucet.myl1.network     # Vercel Faucet
ws://aws-ip:9944               # AWS Blockchain Node
http://aws-ip:9933             # AWS RPC Endpoint
```

---

**Happy deploying! 🎉**

Your MyL1 blockchain is now fully deployed with AWS + Vercel!


