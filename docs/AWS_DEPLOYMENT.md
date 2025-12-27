# 🚀 MyL1 Blockchain AWS Deployment Guide

Complete production deployment of MyL1 blockchain to AWS using Docker, ECS Fargate, and managed services.

## 📋 Prerequisites

### AWS Account Setup
- AWS account with billing enabled
- AWS CLI v2 installed
- Docker installed and running
- Basic AWS knowledge

### Cost Estimate
- **Development**: $10-20/day
- **Production**: $50-200/day (depending on scale)

## 🛠️ Quick Start (Development)

### Step 1: Setup AWS Account
```bash
# Configure AWS CLI (if not done)
aws configure

# Run setup script
./scripts/setup-aws.sh
```

### Step 2: Deploy to AWS
```bash
# Deploy development environment
./scripts/deploy-aws-dev.sh
```

### Step 3: Access Your Blockchain
After deployment completes, you'll get URLs like:
- **Explorer**: http://12.34.56.78:3000
- **REST API**: http://12.34.56.79:3002
- **WebSocket**: ws://internal-ip:9944

## 🏗️ Production Deployment

### Step 1: Full Production Setup
```bash
# Run full production deployment
./scripts/deploy-aws.sh
```

This creates:
- ✅ VPC with public/private subnets
- ✅ ECS cluster with Fargate
- ✅ Application Load Balancer
- ✅ EFS for persistent storage
- ✅ CloudWatch monitoring
- ✅ All services deployed

### Step 2: DNS Setup (Optional)
```bash
# Create Route 53 hosted zone
aws route53 create-hosted-zone --name myl1.network --caller-reference $(date +%s)

# Point your domain to Route 53 nameservers
# Then create records pointing to ALB
```

### Step 3: SSL Certificate (Recommended)
```bash
# Create ACM certificate
aws acm request-certificate \
    --domain-name myl1.network \
    --validation-method DNS \
    --subject-alternative-names "*.myl1.network"

# Update ALB to use HTTPS
```

## 🏛️ Architecture Overview

```
Internet
    ↓
[Route 53] → [CloudFront] (optional)
    ↓
[Application Load Balancer]
    ↓
[ECS Fargate Services]
├── Explorer (React + Nginx)
├── REST API (Node.js)
├── Wallet (React + Nginx)
├── Faucet (Node.js)
└── MyL1 Node (Substrate)
    ↓
[Amazon EFS] (persistent storage)
    ↓
[CloudWatch] (monitoring & logs)
```

## 📊 Services Configuration

### MyL1 Node
- **CPU**: 2 vCPU
- **RAM**: 4-8 GB
- **Storage**: EFS persistent volume
- **Ports**: 9944 (WS), 9933 (RPC)

### REST API
- **CPU**: 0.5 vCPU
- **RAM**: 1 GB
- **Features**: Transaction decoding, account info, TPS calculation

### Explorer
- **CPU**: 0.5 vCPU
- **RAM**: 1 GB
- **Features**: Real-time blocks, transactions, accounts

### Monitoring Stack
- **Prometheus**: Metrics collection
- **Grafana**: Visualization dashboard
- **CloudWatch**: Logs and alerts

## 🔧 Management Commands

### Check Service Status
```bash
# List running services
aws ecs list-services --cluster myl1-dev-cluster

# Check service health
aws ecs describe-services --cluster myl1-dev-cluster --services myl1-dev-node

# View logs
aws logs tail /ecs/myl1-dev-node --follow
aws logs tail /ecs/myl1-dev-api --follow
```

### Scale Services
```bash
# Scale API service
aws ecs update-service \
    --cluster myl1-dev-cluster \
    --service myl1-dev-api \
    --desired-count 3

# Scale node (usually 1 for dev, 2+ for production)
aws ecs update-service \
    --cluster myl1-dev-cluster \
    --service myl1-dev-node \
    --desired-count 1
```

### Update Deployment
```bash
# Build new images
./scripts/deploy-aws-dev.sh

# Or update specific service
aws ecs update-service \
    --cluster myl1-dev-cluster \
    --service myl1-dev-api \
    --force-new-deployment
```

## 💰 Cost Optimization

### Development Environment
- Use Fargate Spot instances: 60-70% cheaper
- Scale down when not in use
- Use smaller instance sizes

### Production Environment
- Use reserved instances for steady workloads
- Implement auto-scaling
- Use CloudFront for global distribution
- Monitor costs with Cost Explorer

## 🔒 Security Best Practices

### Network Security
- ALB only exposes necessary ports
- ECS tasks in private subnets
- Security groups restrict access

### Access Control
- IAM roles with minimal permissions
- No direct SSH access to containers
- API keys stored in Secrets Manager

### Monitoring & Alerts
- CloudWatch alarms for service health
- Failed deployment notifications
- Cost budget alerts

## 🚨 Troubleshooting

### Common Issues

**Services won't start:**
```bash
# Check CloudWatch logs
aws logs tail /ecs/myl1-dev-node --follow

# Check service events
aws ecs describe-services --cluster myl1-dev-cluster --services myl1-dev-node
```

**Node not syncing:**
- Check network connectivity
- Verify bootstrap nodes configuration
- Check EFS mount status

**API returning errors:**
```bash
# Check API logs
aws logs tail /ecs/myl1-dev-api --follow

# Test API endpoint
curl http://your-api-ip:3002/health
```

### Cleanup
```bash
# Stop all services
aws ecs update-service --cluster myl1-dev-cluster --service myl1-dev-node --desired-count 0
aws ecs update-service --cluster myl1-dev-cluster --service myl1-dev-api --desired-count 0
aws ecs update-service --cluster myl1-dev-cluster --service myl1-dev-explorer --desired-count 0

# Delete cluster
aws ecs delete-cluster --cluster myl1-dev-cluster

# Delete ECR repositories
aws ecr delete-repository --repository-name myl1-node --force
aws ecr delete-repository --repository-name myl1-rest-api --force
# ... etc
```

## 📈 Scaling Strategies

### Horizontal Scaling
- Increase service replica count
- Use ALB for load distribution
- Implement health checks

### Vertical Scaling
- Increase CPU/memory allocation
- Use larger Fargate instances
- Optimize application performance

### Global Distribution
- Deploy to multiple regions
- Use Route 53 latency-based routing
- Implement CDN with CloudFront

## 🎯 Next Steps

1. **Test thoroughly** in development environment
2. **Set up monitoring** and alerts
3. **Configure backups** for EFS data
4. **Implement CI/CD** pipeline
5. **Set up staging environment**
6. **Plan production migration**

## 📞 Support

For issues:
1. Check AWS service status
2. Review CloudWatch logs
3. Check ECS service events
4. Verify network configuration
5. Test with development deployment first

---

**Happy deploying! 🚀**

Your MyL1 blockchain is now cloud-native and production-ready.
