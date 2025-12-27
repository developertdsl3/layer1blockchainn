#!/bin/bash

# Force start the blockchain service (after IAM fix)

echo "🚀 FORCING BLOCKCHAIN SERVICE START"
echo "==================================="

aws ecs update-service \
    --cluster myl1-blockchain-cluster \
    --service myl1-blockchain-node \
    --desired-count 1 \
    --region us-east-1

echo "✅ Service update requested"
echo ""
echo "Wait 30 seconds, then check status:"
echo "./scripts/check-blockchain-status.sh"


