# 🚀 MyL1 Blockchain Deployment Guide

## Architecture Overview

```
Frontend Services (Vercel)
├── Explorer: https://explorer.myl1.network
├── Wallet:   https://wallet.myl1.network
└── Faucet:   https://faucet.myl1.network

Blockchain Node (AWS ECS)
└── MyL1 Node: ws://aws-ip:9944, http://aws-ip:9933
```

## Quick Start

### 1. Deploy Blockchain to AWS (5 minutes)

```bash
cd /home/anupam/layer1blockhain

# Deploy only the blockchain node
./scripts/deploy-blockchain-aws.sh
```

**Output:** You'll get AWS endpoints like:
- WebSocket: `ws://12.34.56.78:9944`
- HTTP RPC: `http://12.34.56.78:9933`

### 2. Deploy Frontends to Vercel

**Explorer:**
```bash
cd explorer
npx vercel --prod
# Set env vars: NEXT_PUBLIC_WS_ENDPOINT=ws://YOUR_AWS_IP:9944
```

**Wallet:**
```bash
cd wallet
npx vercel --prod
# Set env vars: NEXT_PUBLIC_WS_ENDPOINT=ws://YOUR_AWS_IP:9944
```

**Faucet:**
```bash
cd infra/faucet
npx vercel --prod
# Set env vars: WS_ENDPOINT=ws://YOUR_AWS_IP:9944
```

## Cost Estimate

- **AWS (Blockchain Node)**: $20-50/month
- **Vercel (Frontends)**: Free to $60/month
- **Total**: $20-110/month

## Management

### Check Blockchain Status
```bash
# AWS service status
aws ecs describe-services --cluster myl1-blockchain-cluster --services myl1-blockchain-node

# View blockchain logs
aws logs tail /ecs/myl1-blockchain-node --follow
```

### Update Frontends
```bash
# Just push to GitHub - Vercel auto-deploys
git push origin main
```

### Stop Everything
```bash
# Stop blockchain
aws ecs update-service --cluster myl1-blockchain-cluster --service myl1-blockchain-node --desired-count 0

# Delete Vercel projects in dashboard
```

## Files Created

- `scripts/deploy-blockchain-aws.sh` - AWS blockchain deployment
- `docs/VERCEL_DEPLOYMENT.md` - Vercel frontend guide
- `docs/AWS_DEPLOYMENT.md` - Full AWS deployment guide

## Support

1. **AWS Issues**: Check ECS service logs
2. **Vercel Issues**: Check Vercel deployment logs
3. **Connection Issues**: Verify AWS security groups allow ports 9944, 9933

---

**You're ready to deploy! 🎉**


