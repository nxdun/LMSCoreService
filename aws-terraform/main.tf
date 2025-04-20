# main.tf
terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# Get the latest Amazon Linux 2 AMI
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

# Security group for LMS application
resource "aws_security_group" "lms_security_group" {
  name        = "lms_security_group"
  description = "Security group for LMS application"
  vpc_id      = data.aws_vpc.default.id

  # SSH access
  ingress {
    description = "SSH access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP access
  ingress {
    description = "HTTP access"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS access
  ingress {
    description = "HTTPS access"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # API Gateway port
  ingress {
    description = "API Gateway access"
    from_port   = 5001
    to_port     = 5001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Authentication service port
  ingress {
    description = "Authentication service"
    from_port   = 2222
    to_port     = 2222
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Lecturer service port
  ingress {
    description = "Lecturer service"
    from_port   = 1113
    to_port     = 1113
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Payment service port
  ingress {
    description = "Payment service"
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Course management port
  ingress {
    description = "Course management service"
    from_port   = 3002
    to_port     = 3002
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Storage service port
  ingress {
    description = "Storage service"
    from_port   = 2345
    to_port     = 2345
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Notification service port
  ingress {
    description = "Notification service"
    from_port   = 1114
    to_port     = 1114
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Support backend port
  ingress {
    description = "Support backend"
    from_port   = 8074
    to_port     = 8074
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Email service port
  ingress {
    description = "Email service"
    from_port   = 8076
    to_port     = 8076
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Certificate service port
  ingress {
    description = "Certificate service"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # PostgreSQL port
  ingress {
    description = "PostgreSQL database"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Prometheus port
  ingress {
    description = "Prometheus monitoring"
    from_port   = 9090
    to_port     = 9090
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Grafana port
  ingress {
    description = "Grafana dashboard"
    from_port   = 9010
    to_port     = 9010
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "lms_security_group"
    Project = "LMS Core Service"
  }
}

data "aws_vpc" "default" {
  default = true
}

resource "aws_instance" "lms_server" {
  ami             = data.aws_ami.amazon_linux.id
  instance_type   = "t2.large"  # Increased for better performance with multiple containers
  key_name        = aws_key_pair.deployer.key_name
  security_groups = [aws_security_group.lms_security_group.name]
  
  root_block_device {
    volume_size = 30  # Increased storage for Docker images and volumes
    volume_type = "gp2"
  }

  tags = {
    Name    = "LMS-Server"
    Project = "LMS Core Service"
  }

  user_data = <<-EOF
              #!/bin/bash
              # Update system
              yum update -y
              
              # Install Docker
              amazon-linux-extras install docker -y
              systemctl start docker
              systemctl enable docker
              usermod -a -G docker ec2-user
              
              # Install Docker Compose
              curl -L "https://github.com/docker/compose/releases/download/v2.17.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
              chmod +x /usr/local/bin/docker-compose
              
              # Install Git
              yum install -y git
              
              # Clone your repository
              mkdir -p /opt/lms
              git clone https://github.com/udeesharukshan/LMSCoreService.git /opt/lms
              
              # Set up environment
              cd /opt/lms
              
              # Create Prometheus config
              cat > prometheus.yml <<'EOL'
              global:
                scrape_interval: 15s
                evaluation_interval: 15s
              
              scrape_configs:
                - job_name: 'prometheus'
                  static_configs:
                    - targets: ['localhost:9090']
                - job_name: 'api-gateway'
                  static_configs:
                    - targets: ['api-gateway:5001']
                - job_name: 'authentication-service'
                  static_configs:
                    - targets: ['authentication-service:2222']
                - job_name: 'lecturer-service'
                  static_configs:
                    - targets: ['lecturer-service:1113']
                - job_name: 'payment-service'
                  static_configs:
                    - targets: ['payment-service:3001']
                - job_name: 'coursemanagement-service'
                  static_configs:
                    - targets: ['coursemanagement-service:3002']
                - job_name: 'storage-service'
                  static_configs:
                    - targets: ['storage-service:2345']
                - job_name: 'notification-service'
                  static_configs:
                    - targets: ['notification-service:1114']
                - job_name: 'support-backend'
                  static_configs:
                    - targets: ['support-backend:8074']
                - job_name: 'email-service'
                  static_configs:
                    - targets: ['email-service:8076']
                - job_name: 'certificate-service'
                  static_configs:
                    - targets: ['certificate-service:8080']
              EOL
              
              # Start the application
              docker-compose up -d
              EOF
}

resource "aws_key_pair" "deployer" {
  key_name   = "lms-deployer-key"
  public_key = file("~/.ssh/id_rsa.pub")
}

# Elastic IP for the LMS server
resource "aws_eip" "lms_eip" {
  instance = aws_instance.lms_server.id
  vpc      = true
  tags = {
    Name = "lms-eip"
    Project = "LMS Core Service"
  }
}

output "instance_public_ip" {
  description = "Public IP address of the LMS instance"
  value       = aws_eip.lms_eip.public_ip
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh ec2-user@${aws_eip.lms_eip.public_ip}"
}

output "application_url" {
  description = "URL to access the LMS application"
  value       = "http://${aws_eip.lms_eip.public_ip}"
}

output "prometheus_url" {
  description = "URL to access Prometheus"
  value       = "http://${aws_eip.lms_eip.public_ip}:9090"
}

output "grafana_url" {
  description = "URL to access Grafana"
  value       = "http://${aws_eip.lms_eip.public_ip}:9010"
}