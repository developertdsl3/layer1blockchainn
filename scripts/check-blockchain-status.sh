#!/bin/bash

# Quick status check for MyL1 blockchain on AWS

echo "🔍 MyL1 Blockchain Status Check"
echo "================================"

REGION="us-east-1"
CLUSTER="myl1-blockchain-cluster"
SERVICE="myl1-blockchain-node"

# Check if service is running
RUNNING_COUNT=$(aws ecs describe-services \
    --cluster "$CLUSTER" \
    --services "$SERVICE" \
    --region "$REGION" \
    --query 'services[0].runningCount' \
    --output text 2>/dev/null || echo "ERROR")

if [ "$RUNNING_COUNT" = "1" ]; then
    echo "✅ BLOCKCHAIN IS RUNNING!"
    echo ""

    # Get task ARN
    TASK_ARN=$(aws ecs list-tasks \
        --cluster "$CLUSTER" \
        --service-name "$SERVICE" \
        --region "$REGION" \
        --query 'taskArns[0]' \
        --output text 2>/dev/null)

    if [ -n "$TASK_ARN" ] && [ "$TASK_ARN" != "None" ]; then
        # Get network interface and public IP
        ENI_ID=$(aws ecs describe-tasks \
            --cluster "$CLUSTER" \
            --tasks "$TASK_ARN" \
            --region "$REGION" \
            --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
            --output text 2>/dev/null)

        if [ -n "$ENI_ID" ] && [ "$ENI_ID" != "None" ]; then
            PUBLIC_IP=$(aws ec2 describe-network-interfaces \
                --network-interface-ids "$ENI_ID" \
                --region "$REGION" \
                --query 'NetworkInterfaces[0].Association.PublicIp' \
                --output text 2>/dev/null || echo "")

            if [ -n "$PUBLIC_IP" ] && [ "$PUBLIC_IP" != "None" ]; then
                echo "🌐 BLOCKCHAIN ENDPOINTS:"
                echo "========================"
                echo "WebSocket: ws://$PUBLIC_IP:9944"
                echo "HTTP RPC:  http://$PUBLIC_IP:9933"
                echo "P2P:       $PUBLIC_IP:30333"
                echo ""
                echo "🎯 READY FOR VERCEL FRONTENDS!"
                echo "=============================="
                echo "Add these to your Vercel environment variables:"
                echo "NEXT_PUBLIC_WS_ENDPOINT=ws://$PUBLIC_IP:9944"
                echo "NEXT_PUBLIC_RPC_ENDPOINT=http://$PUBLIC_IP:9933"
            else
                echo "⚠️  Public IP not available yet. Wait a few more minutes."
            fi
        fi
    fi

    echo ""
    echo "📊 View logs:"
    echo "aws logs tail /ecs/myl1-blockchain-node --follow --region $REGION"

elif [ "$RUNNING_COUNT" = "0" ]; then
    echo "❌ BLOCKCHAIN NOT RUNNING"
    echo ""
    echo "🔧 Fix IAM permissions first:"
    echo "./scripts/fix-iam-permissions.sh"
    echo ""
    echo "Then update service:"
    echo "aws ecs update-service --cluster $CLUSTER --service $SERVICE --desired-count 1 --region $REGION"

else
    echo "❓ UNKNOWN STATUS (Running count: $RUNNING_COUNT)"
    echo ""
    echo "Check service details:"
    echo "aws ecs describe-services --cluster $CLUSTER --services $SERVICE --region $REGION"
fi


