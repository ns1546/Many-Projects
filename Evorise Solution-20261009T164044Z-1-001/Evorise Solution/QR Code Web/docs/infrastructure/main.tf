# EVORISE ENTERPRISE CLOUD INFRASTRUCTURE
# Cloud Provider: AWS
# Tool: Terraform >= 1.5.0

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = "evorise-terraform-state-prod"
    key    = "infrastructure/prod.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = "us-east-1"
}

# 1. VIRTUAL PRIVATE CLOUD (VPC)
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = "evorise-prod-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = false # High availability across AZs
  
  tags = {
    Environment = "production"
    Project     = "evorise-restaurant-system"
  }
}

# 2. KUBERNETES CLUSTER (EKS)
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "19.15.3"

  cluster_name    = "evorise-prod-cluster"
  cluster_version = "1.28"

  vpc_id                   = module.vpc.vpc_id
  subnet_ids               = module.vpc.private_subnets
  cluster_endpoint_public_access = false # Absolute Security: Control plane accessed only via Bastion/VPN

  eks_managed_node_groups = {
    # Stateful Node Group (Databases, Kafka)
    stateful = {
      min_size     = 3
      max_size     = 10
      desired_size = 3
      instance_types = ["m6i.2xlarge"]
      capacity_type  = "ON_DEMAND"
      labels = {
        workload = "stateful"
      }
    }
    # Stateless Node Group (API Gateway, Microservices)
    stateless = {
      min_size     = 5
      max_size     = 100 # Scales massively during traffic spikes
      desired_size = 5
      instance_types = ["c6i.large", "c6i.xlarge"]
      capacity_type  = "SPOT" # 70% cost savings for stateless pods
      labels = {
        workload = "stateless"
      }
    }
  }
}

# 3. MANAGED POSTGRESQL (RDS)
resource "aws_db_instance" "evorise_db" {
  identifier           = "evorise-prod-db"
  allocated_storage    = 100
  max_allocated_storage = 1000 # Auto-scaling storage
  storage_type         = "io1"
  iops                 = 3000
  engine               = "postgres"
  engine_version       = "16.1"
  instance_class       = "db.r6g.2xlarge"
  db_name              = "evorise_orders"
  username             = "evorise_admin"
  password             = var.db_password # Injected via AWS Secrets Manager
  
  multi_az             = true # Synchronous replication for Disaster Recovery
  publicly_accessible  = false
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  db_subnet_group_name = module.vpc.database_subnet_group
  
  backup_retention_period = 35
  storage_encrypted       = true
}

# 4. SECURITY GROUPS (Zero Trust Network)
resource "aws_security_group" "db_sg" {
  name        = "evorise-db-sg"
  description = "Allow inbound traffic strictly from EKS private subnets"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description     = "PostgreSQL from EKS"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    cidr_blocks     = module.vpc.private_subnets_cidr_blocks
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
