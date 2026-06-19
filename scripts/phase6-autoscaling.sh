#!/bin/bash
# ==========================================================================
# GymSync — Phase 6: Auto Scaling & High Availability Setup
# Run this in AWS Session Manager on the EC2 instance
# ==========================================================================
set -e
REGION="ap-south-1"
VPC_ID="vpc-0395bd899a31f2d10"
INSTANCE_ID="i-00986d4453cf86141"
AMI_ID="ami-07101e70602524a82"
SG_ID="sg-0399b7fe122518c65"

echo "============================================"
echo "Phase 6: Auto Scaling & High Availability"
echo "============================================"

# 1. Get subnet IDs (need 2 AZs for Multi-AZ)
echo ""
echo "📋 Step 1: Getting subnet IDs..."
SUBNET1=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" "Name=tag:Name,Values=*public1*" --query 'Subnets[0].SubnetId' --output text --region $REGION 2>/dev/null)
SUBNET2=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" "Name=tag:Name,Values=*public2*" --query 'Subnets[0].SubnetId' --output text --region $REGION 2>/dev/null)

if [ "$SUBNET1" == "None" ] || [ -z "$SUBNET1" ]; then
  SUBNETS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query 'Subnets[*].SubnetId' --output text --region $REGION)
  SUBNET1=$(echo $SUBNETS | awk '{print $1}')
  SUBNET2=$(echo $SUBNETS | awk '{print $2}')
fi
echo "  Subnet 1: $SUBNET1"
echo "  Subnet 2: $SUBNET2"

# 2. Create Launch Template
echo ""
echo "🚀 Step 2: Creating Launch Template..."
aws ec2 create-launch-template \
  --launch-template-name gymsync-lt \
  --version-description "GymSync production server" \
  --launch-template-data "{
    \"ImageId\": \"$AMI_ID\",
    \"InstanceType\": \"t3.micro\",
    \"SecurityGroupIds\": [\"$SG_ID\"],
    \"UserData\": \"$(echo '#!/bin/bash
cd /home/ssm-user/gymsync
docker compose up -d' | base64 -w0)\",
    \"TagSpecifications\": [{
      \"ResourceType\": \"instance\",
      \"Tags\": [{\"Key\": \"Name\", \"Value\": \"gymsync-asg-instance\"}]
    }]
  }" --region $REGION 2>&1
echo "✅ Launch Template created"

# 3. Create Target Group
echo ""
echo "🎯 Step 3: Creating Target Group..."
TG_ARN=$(aws elbv2 create-target-group \
  --name gymsync-tg \
  --protocol HTTP \
  --port 80 \
  --vpc-id $VPC_ID \
  --health-check-protocol HTTP \
  --health-check-path /api/health \
  --health-check-interval-seconds 30 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --target-type instance \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text \
  --region $REGION 2>&1)
echo "  Target Group ARN: $TG_ARN"
echo "✅ Target Group created"

# 4. Create Application Load Balancer
echo ""
echo "⚖️ Step 4: Creating Application Load Balancer..."
ALB_ARN=$(aws elbv2 create-load-balancer \
  --name gymsync-alb \
  --subnets $SUBNET1 $SUBNET2 \
  --security-groups $SG_ID \
  --scheme internet-facing \
  --type application \
  --ip-address-type ipv4 \
  --query 'LoadBalancers[0].LoadBalancerArn' \
  --output text \
  --region $REGION 2>&1)
echo "  ALB ARN: $ALB_ARN"

ALB_DNS=$(aws elbv2 describe-load-balancers \
  --load-balancer-arns $ALB_ARN \
  --query 'LoadBalancers[0].DNSName' \
  --output text \
  --region $REGION 2>&1)
echo "  ALB DNS: $ALB_DNS"
echo "✅ ALB created"

# 5. Create Listener (forward port 80 to target group)
echo ""
echo "📡 Step 5: Creating ALB Listener..."
aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=$TG_ARN \
  --region $REGION 2>&1
echo "✅ Listener created"

# 6. Register existing instance with target group
echo ""
echo "📌 Step 6: Registering current instance..."
aws elbv2 register-targets \
  --target-group-arn $TG_ARN \
  --targets Id=$INSTANCE_ID \
  --region $REGION 2>&1
echo "✅ Instance registered with Target Group"

# 7. Create Auto Scaling Group
echo ""
echo "📈 Step 7: Creating Auto Scaling Group..."
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name gymsync-asg \
  --launch-template LaunchTemplateName=gymsync-lt,Version='$Latest' \
  --min-size 1 \
  --max-size 3 \
  --desired-capacity 1 \
  --vpc-zone-identifier "$SUBNET1,$SUBNET2" \
  --target-group-arns $TG_ARN \
  --health-check-type ELB \
  --health-check-grace-period 300 \
  --tags "Key=Name,Value=gymsync-asg-instance,PropagateAtLaunch=true" \
  --region $REGION 2>&1
echo "✅ Auto Scaling Group created (min:1, max:3)"

# 8. Create Scaling Policies
echo ""
echo "📊 Step 8: Creating Scaling Policies..."

# Scale UP when CPU > 70%
aws autoscaling put-scaling-policy \
  --auto-scaling-group-name gymsync-asg \
  --policy-name gymsync-scale-up \
  --policy-type TargetTrackingScaling \
  --target-tracking-configuration "{
    \"PredefinedMetricSpecification\": {
      \"PredefinedMetricType\": \"ASGAverageCPUUtilization\"
    },
    \"TargetValue\": 70.0,
    \"ScaleInCooldown\": 300,
    \"ScaleOutCooldown\": 60
  }" \
  --region $REGION 2>&1
echo "✅ CPU-based scaling policy (target: 70%)"

echo ""
echo "============================================"
echo "✅ PHASE 6 COMPLETE!"
echo "============================================"
echo ""
echo "🌐 ALB DNS: $ALB_DNS"
echo "📈 Auto Scaling: 1-3 instances"
echo "🎯 Health Check: /api/health"
echo "⚖️ Multi-AZ: $SUBNET1, $SUBNET2"
echo ""
