#!/bin/bash
set -euo pipefail

# AWS Setup Script for MyL1 Blockchain
# This script helps configure AWS account for MyL1 deployment

REGION=${AWS_REGION:-us-east-1}
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "🔧 MyL1 AWS Setup"
echo "================="
echo "Region: $REGION"
echo "Account: $ACCOUNT_ID"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check AWS CLI
check_aws_cli() {
    log_info "Checking AWS CLI..."

    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed."
        echo "Please install AWS CLI v2:"
        echo "  curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip'"
        echo "  unzip awscliv2.zip"
        echo "  sudo ./aws/install"
        exit 1
    fi

    aws --version
    log_success "AWS CLI is installed"
}

# Configure AWS CLI
configure_aws() {
    log_info "Configuring AWS CLI..."

    if ! aws sts get-caller-identity &> /dev/null; then
        log_warning "AWS CLI not configured. Running 'aws configure'..."
        aws configure

        # Verify configuration
        if ! aws sts get-caller-identity &> /dev/null; then
            log_error "AWS CLI configuration failed."
            exit 1
        fi
    fi

    log_success "AWS CLI configured"
}

# Create IAM policies and roles
create_iam_roles() {
    log_info "Creating IAM roles and policies..."

    # ECS Task Execution Role (if not exists)
    if ! aws iam get-role --role-name ecsTaskExecutionRole &> /dev/null; then
        log_info "Creating ECS Task Execution Role..."
        aws iam create-role \
            --role-name ecsTaskExecutionRole \
            --assume-role-policy-document '{
                "Version": "2012-10-17",
                "Statement": [{
                    "Effect": "Allow",
                    "Principal": {"Service": "ecs-tasks.amazonaws.com"},
                    "Action": "sts:AssumeRole"
                }]
            }'

        aws iam attach-role-policy \
            --role-name ecsTaskExecutionRole \
            --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

        log_success "ECS Task Execution Role created"
    else
        log_info "ECS Task Execution Role already exists"
    fi

    # Additional permissions for EFS and CloudWatch
    cat > /tmp/ecs-additional-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "elasticfilesystem:ClientMount",
                "elasticfilesystem:ClientWrite",
                "elasticfilesystem:DescribeMountTargets"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
                "logs:DescribeLogStreams"
            ],
            "Resource": "arn:aws:logs:*:*:*"
        }
    ]
}
EOF

    aws iam put-role-policy \
        --role-name ecsTaskExecutionRole \
        --policy-name MyL1ECSAdditionalPolicy \
        --policy-document file:///tmp/ecs-additional-policy.json

    log_success "IAM roles and policies configured"
}

# Enable required services
enable_services() {
    log_info "Enabling required AWS services..."

    # Enable ECS
    aws ecs describe-clusters --cluster myl1-dev-cluster 2>/dev/null || true

    # Enable ECR
    aws ecr describe-registry 2>/dev/null || true

    # Enable EFS (if needed for production)
    # aws efs describe-file-systems 2>/dev/null || true

    log_success "AWS services enabled"
}

# Create key pair for EC2 access (if needed)
create_keypair() {
    log_info "Checking for SSH key pair..."

    if ! aws ec2 describe-key-pairs --key-names myl1-keypair &> /dev/null; then
        log_warning "Creating SSH key pair..."
        aws ec2 create-key-pair \
            --key-name myl1-keypair \
            --query 'KeyMaterial' \
            --output text > myl1-keypair.pem

        chmod 400 myl1-keypair.pem
        log_warning "SSH key pair created: myl1-keypair.pem"
        log_warning "Keep this file secure - it's needed for EC2 access!"
    else
        log_info "SSH key pair already exists"
    fi
}

# Setup VPC (basic setup)
setup_vpc() {
    log_info "Setting up VPC..."

    # Check if default VPC exists
    DEFAULT_VPC=$(aws ec2 describe-vpcs \
        --filters Name=isDefault,Values=true \
        --query 'Vpcs[0].VpcId' \
        --output text 2>/dev/null || echo "")

    if [ -n "$DEFAULT_VPC" ]; then
        log_success "Default VPC found: $DEFAULT_VPC"
        return
    fi

    log_warning "No default VPC found. Creating basic VPC..."

    # Create VPC
    VPC_ID=$(aws ec2 create-vpc \
        --cidr-block 10.0.0.0/16 \
        --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=myl1-vpc}]" \
        --query 'Vpc.VpcId' \
        --output text)

    # Enable DNS hostnames
    aws ec2 modify-vpc-attribute --vpc-id "$VPC_ID" --enable-dns-hostnames

    # Create subnets
    SUBNET_1=$(aws ec2 create-subnet \
        --vpc-id "$VPC_ID" \
        --cidr-block 10.0.1.0/24 \
        --availability-zone "${REGION}a" \
        --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=myl1-subnet-1}]" \
        --query 'Subnet.SubnetId' \
        --output text)

    SUBNET_2=$(aws ec2 create-subnet \
        --vpc-id "$VPC_ID" \
        --cidr-block 10.0.2.0/24 \
        --availability-zone "${REGION}b" \
        --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=myl1-subnet-2}]" \
        --query 'Subnet.SubnetId' \
        --output text)

    # Create Internet Gateway
    IGW_ID=$(aws ec2 create-internet-gateway \
        --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=myl1-igw}]" \
        --query 'InternetGateway.InternetGatewayId' \
        --output text)

    aws ec2 attach-internet-gateway --vpc-id "$VPC_ID" --internet-gateway-id "$IGW_ID"

    # Create route table
    RT_ID=$(aws ec2 create-route-table \
        --vpc-id "$VPC_ID" \
        --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=myl1-rt}]" \
        --query 'RouteTable.RouteTableId' \
        --output text)

    aws ec2 create-route --route-table-id "$RT_ID" --destination-cidr-block 0.0.0.0/0 --gateway-id "$IGW_ID"

    # Associate subnets
    aws ec2 associate-route-table --subnet-id "$SUBNET_1" --route-table-id "$RT_ID"
    aws ec2 associate-route-table --subnet-id "$SUBNET_2" --route-table-id "$RT_ID"

    log_success "VPC setup complete"
}

# Display summary
show_summary() {
    echo ""
    log_success "🎉 AWS Setup Complete!"
    echo ""
    echo "Your AWS account is ready for MyL1 deployment."
    echo ""
    echo "Next steps:"
    echo "1. For development deployment: ./scripts/deploy-aws-dev.sh"
    echo "2. For production deployment: ./scripts/deploy-aws.sh"
    echo ""
    echo "Account Information:"
    echo "  Account ID: $ACCOUNT_ID"
    echo "  Region: $REGION"
    echo "  ECR Base: $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"
    echo ""
    echo "Useful commands:"
    echo "  aws ecs list-clusters"
    echo "  aws ecr describe-repositories"
    echo "  aws logs tail /ecs/myl1-dev-node --follow"
}

# Main setup function
main() {
    echo "Setting up AWS account for MyL1 Blockchain deployment..."
    echo ""

    check_aws_cli
    configure_aws
    create_iam_roles
    enable_services
    create_keypair
    setup_vpc
    show_summary
}

# Run main function
main "$@"
