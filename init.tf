terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC and Networking
resource "aws_vpc" "lms_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "lms-vpc"
  }
}

resource "aws_subnet" "public_subnet_1" {
  vpc_id                  = aws_vpc.lms_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "lms-public-subnet-1"
  }
}

resource "aws_subnet" "public_subnet_2" {
  vpc_id                  = aws_vpc.lms_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = true

  tags = {
    Name = "lms-public-subnet-2"
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.lms_vpc.id

  tags = {
    Name = "lms-igw"
  }
}

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.lms_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "lms-public-rt"
  }
}

resource "aws_route_table_association" "public_1" {
  subnet_id      = aws_subnet.public_subnet_1.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "public_2" {
  subnet_id      = aws_subnet.public_subnet_2.id
  route_table_id = aws_route_table.public_rt.id
}

# Security Groups
resource "aws_security_group" "lb_sg" {
  name        = "lb-sg"
  description = "Allow inbound traffic to the load balancer"
  vpc_id      = aws_vpc.lms_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "lms-lb-sg"
  }
}

resource "aws_security_group" "ecs_sg" {
  name        = "ecs-sg"
  description = "Allow traffic from load balancer to ECS"
  vpc_id      = aws_vpc.lms_vpc.id

  ingress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    security_groups = [aws_security_group.lb_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "lms-ecs-sg"
  }
}

# RDS PostgreSQL for notification DB
resource "aws_db_subnet_group" "postgres_subnet_group" {
  name       = "postgres-subnet-group"
  subnet_ids = [aws_subnet.public_subnet_1.id, aws_subnet.public_subnet_2.id]

  tags = {
    Name = "lms-postgres-subnet-group"
  }
}

resource "aws_security_group" "rds_sg" {
  name        = "rds-sg"
  description = "Allow traffic from ECS to RDS"
  vpc_id      = aws_vpc.lms_vpc.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "lms-rds-sg"
  }
}

resource "aws_db_instance" "postgres" {
  identifier             = "lms-postgres"
  allocated_storage      = 20
  engine                 = "postgres"
  engine_version         = "14"
  instance_class         = "db.t3.micro"
  db_name                = "notifydb"
  username               = "postgres"
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.postgres_subnet_group.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  publicly_accessible    = false
  skip_final_snapshot    = true

  tags = {
    Name = "lms-postgres"
  }
}

# ECR Repositories
resource "aws_ecr_repository" "api_gateway" {
  name = "lms-api-gateway"
}

resource "aws_ecr_repository" "authentication_service" {
  name = "lms-authentication-service"
}

resource "aws_ecr_repository" "lecturer_service" {
  name = "lms-lecturer-service"
}

resource "aws_ecr_repository" "payment_service" {
  name = "lms-payment-service"
}

resource "aws_ecr_repository" "course_management_service" {
  name = "lms-course-management-service"
}

resource "aws_ecr_repository" "storage_service" {
  name = "lms-storage-service"
}

resource "aws_ecr_repository" "notification_service" {
  name = "lms-notification-service"
}

resource "aws_ecr_repository" "support_backend" {
  name = "lms-support-backend"
}

resource "aws_ecr_repository" "email_service" {
  name = "lms-email-service"
}

# ECS Cluster
resource "aws_ecs_cluster" "lms_cluster" {
  name = "lms-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# Load Balancer
resource "aws_lb" "lms_lb" {
  name               = "lms-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.lb_sg.id]
  subnets            = [aws_subnet.public_subnet_1.id, aws_subnet.public_subnet_2.id]

  tags = {
    Name = "lms-lb"
  }
}

resource "aws_lb_target_group" "api_gateway_tg" {
  name        = "api-gateway-tg"
  port        = 5000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.lms_vpc.id
  target_type = "ip"

  health_check {
    path                = "/health"
    port                = "traffic-port"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
  }
}

resource "aws_lb_listener" "lms_listener" {
  load_balancer_arn = aws_lb.lms_lb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api_gateway_tg.arn
  }
}

# IAM Roles for ECS
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# ECS Task Definitions and Services
resource "aws_ecs_task_definition" "api_gateway" {
  family                   = "api-gateway"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "api-gateway"
      image     = "${aws_ecr_repository.api_gateway.repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = 5000
          hostPort      = 5000
        }
      ]
      environment = [
        { name = "SERVICE_NAME_LEC", value = "http://lecturer-service:1113" },
        { name = "SERVICE_NAME_AUTH", value = "http://authentication-service:2222" },
        { name = "SERVICE_NAME_PAY", value = "http://payment-service:3001" },
        { name = "SERVICE_NAME_COURSE", value = "http://coursemanagement-service:3002" },
        { name = "SERVICE_NAME_STORAGE", value = "http://storage-service:2345" },
        { name = "SERVICE_NAME_NOTIFICATION", value = "http://notification-service:1114" }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/api-gateway"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
          "awslogs-create-group"  = "true"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "api_gateway" {
  name            = "api-gateway"
  cluster         = aws_ecs_cluster.lms_cluster.id
  task_definition = aws_ecs_task_definition.api_gateway.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = [aws_subnet.public_subnet_1.id, aws_subnet.public_subnet_2.id]
    security_groups = [aws_security_group.ecs_sg.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api_gateway_tg.arn
    container_name   = "api-gateway"
    container_port   = 5000
  }

  depends_on = [aws_lb_listener.lms_listener]
}

# Similar task definitions and services would be created for each microservice
# For brevity, I'm showing just the API Gateway as an example

# CloudWatch Logs for all services
resource "aws_cloudwatch_log_group" "api_gateway_logs" {
  name              = "/ecs/api-gateway"
  retention_in_days = 30
}

# SSM Parameters for environment variables
resource "aws_ssm_parameter" "db_url" {
  name  = "/lms/db-url"
  type  = "SecureString"
  value = "postgresql://postgres:${var.db_password}@${aws_db_instance.postgres.endpoint}/notifydb"
}

# Output the ALB DNS name
output "load_balancer_dns" {
  value = aws_lb.lms_lb.dns_name
}