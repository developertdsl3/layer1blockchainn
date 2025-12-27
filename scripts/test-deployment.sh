#!/bin/bash
set -euo pipefail

# Test Deployment Script
# Tests the complete MyL1 stack locally before AWS deployment

echo "🧪 Testing MyL1 Deployment"
echo "=========================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Test Docker images build
test_docker_builds() {
    log_info "Testing Docker image builds..."

    # Test Node build
    if docker build -f docker/dockerfiles/substrate_injected.Dockerfile -t test-myl1-node .; then
        log_success "Node Docker build"
    else
        log_error "Node Docker build failed"
        return 1
    fi

    # Test API build
    if docker build -f infra/rest-api/Dockerfile.production -t test-myl1-api infra/rest-api/; then
        log_success "API Docker build"
    else
        log_error "API Docker build failed"
        return 1
    fi

    # Test Explorer build
    if docker build -f explorer/Dockerfile.production -t test-myl1-explorer explorer/; then
        log_success "Explorer Docker build"
    else
        log_error "Explorer Docker build failed"
        return 1
    fi

    # Test Wallet build
    if docker build -f wallet/Dockerfile.production -t test-myl1-wallet wallet/; then
        log_success "Wallet Docker build"
    else
        log_error "Wallet Docker build failed"
        return 1
    fi

    # Test Faucet build
    if docker build -f infra/faucet/Dockerfile.production -t test-myl1-faucet infra/faucet/; then
        log_success "Faucet Docker build"
    else
        log_error "Faucet Docker build failed"
        return 1
    fi
}

# Test full stack deployment
test_full_stack() {
    log_info "Testing full stack deployment..."

    # Start services with docker-compose
    log_info "Starting services..."
    cd infra/full-stack

    # Modify docker-compose for testing (use local images)
    sed 's|image:.*|image: test-myl1-node:latest|' docker-compose.yml > docker-compose.test.yml
    sed -i 's|image:.*rest-api.*|image: test-myl1-api:latest|' docker-compose.test.yml
    sed -i 's|image:.*explorer.*|image: test-myl1-explorer:latest|' docker-compose.test.yml
    sed -i 's|image:.*wallet.*|image: test-myl1-wallet:latest|' docker-compose.test.yml
    sed -i 's|image:.*faucet.*|image: test-myl1-faucet:latest|' docker-compose.test.yml

    # Start services
    docker-compose -f docker-compose.test.yml up -d

    # Wait for services
    log_info "Waiting for services to start..."
    sleep 30

    # Test health checks
    test_service_health() {
        local service=$1
        local url=$2
        local max_attempts=10
        local attempt=1

        while [ $attempt -le $max_attempts ]; do
            if curl -f -s "$url" > /dev/null 2>&1; then
                log_success "$service health check"
                return 0
            fi
            log_info "Waiting for $service (attempt $attempt/$max_attempts)..."
            sleep 10
            ((attempt++))
        done

        log_error "$service health check failed"
        return 1
    }

    # Test services
    local all_healthy=true

    if ! test_service_health "Node" "http://localhost:9944"; then all_healthy=false; fi
    if ! test_service_health "API" "http://localhost:3002/health"; then all_healthy=false; fi
    if ! test_service_health "Explorer" "http://localhost:3000"; then all_healthy=false; fi
    if ! test_service_health "Wallet" "http://localhost:3001"; then all_healthy=false; fi
    if ! test_service_health "Faucet" "http://localhost:3003/health"; then all_healthy=false; fi

    # Cleanup
    log_info "Cleaning up test deployment..."
    docker-compose -f docker-compose.test.yml down -v
    rm docker-compose.test.yml
    cd ../..

    if [ "$all_healthy" = true ]; then
        log_success "Full stack deployment test"
        return 0
    else
        log_error "Full stack deployment test failed"
        return 1
    fi
}

# Test AWS CLI configuration
test_aws_config() {
    log_info "Testing AWS configuration..."

    if command -v aws &> /dev/null; then
        if aws sts get-caller-identity &> /dev/null; then
            log_success "AWS CLI configuration"
            return 0
        else
            log_error "AWS CLI not configured (run 'aws configure')"
            return 1
        fi
    else
        log_error "AWS CLI not installed"
        return 1
    fi
}

# Main test function
main() {
    echo "Running pre-deployment tests..."
    echo ""

    local all_passed=true

    # Run tests
    if ! test_docker_builds; then all_passed=false; fi
    echo ""

    if ! test_full_stack; then all_passed=false; fi
    echo ""

    if ! test_aws_config; then all_passed=false; fi
    echo ""

    # Summary
    if [ "$all_passed" = true ]; then
        log_success "🎉 All tests passed! Ready for AWS deployment."
        echo ""
        echo "Next steps:"
        echo "1. Run: ./scripts/setup-aws.sh"
        echo "2. Run: ./scripts/deploy-aws-dev.sh"
        echo ""
        echo "Or for production:"
        echo "   ./scripts/deploy-aws.sh"
        exit 0
    else
        log_error "❌ Some tests failed. Please fix issues before deploying."
        exit 1
    fi
}

# Run main function
main "$@"
