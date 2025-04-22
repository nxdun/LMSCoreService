# main.tf for GCP deployment
terraform {
  required_version = ">= 1.0.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# Create VPC network
resource "google_compute_network" "lms_network" {
  name                    = "lms-network"
  auto_create_subnetworks = true
}

# Create firewall rules equivalent to AWS security group
resource "google_compute_firewall" "lms_firewall" {
  name    = "lms-firewall"
  network = google_compute_network.lms_network.self_link

  # SSH access
  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  # HTTP/HTTPS access
  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }

  # Microservices ports
  allow {
    protocol = "tcp"
    ports    = [
      "5001",  # API Gateway
      "2222",  # Authentication service
      "1113",  # Lecturer service
      "3001",  # Payment service
      "3002",  # Course management service
      "2345",  # Storage service
      "1114",  # Notification service
      "8074",  # Support backend
      "8076",  # Email service
      "8080",  # Certificate service
      "5432",  # PostgreSQL
      "9090",  # Prometheus
      "9010"   # Grafana
    ]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["lms-server"]
}

# Create a Compute Engine VM instance
resource "google_compute_instance" "lms_server" {
  name         = "lms-server"
  machine_type = "e2-standard-2"  # Equivalent to t2.large
  tags         = ["lms-server"]

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
      size  = 30  # 30GB storage
      type  = "pd-standard"
    }
  }

  network_interface {
    network = google_compute_network.lms_network.self_link
    access_config {
      nat_ip = google_compute_address.lms_static_ip.address
    }
  }

  metadata = {
    ssh-keys = "${var.ssh_username}:${file(var.ssh_public_key_path)}"
  }

  metadata_startup_script = <<-EOF
    #!/bin/bash
    
    # Update system
    apt-get update
    apt-get upgrade -y
    
    # Install dependencies
    apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release git
    
    # Install Docker
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io
    
    # Add user to docker group
    usermod -aG docker ${var.ssh_username}
    systemctl enable docker
    systemctl start docker
    
    # Install Docker Compose
    curl -L "https://github.com/docker/compose/releases/download/v2.17.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Clone repository
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

  service_account {
    scopes = ["cloud-platform"]
  }
}

# Reserve a static external IP
resource "google_compute_address" "lms_static_ip" {
  name = "lms-static-ip"
}

# Variables file
variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "GCP zone"
  type        = string
  default     = "us-central1-a"
}

variable "ssh_username" {
  description = "Username for SSH access"
  type        = string
  default     = "lms-admin"
}

variable "ssh_public_key_path" {
  description = "Path to SSH public key file"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}

# Outputs
output "instance_name" {
  description = "Name of the VM instance"
  value       = google_compute_instance.lms_server.name
}

output "instance_external_ip" {
  description = "External IP address of the VM instance"
  value       = google_compute_address.lms_static_ip.address
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh ${var.ssh_username}@${google_compute_address.lms_static_ip.address}"
}

output "application_url" {
  description = "URL to access the LMS application"
  value       = "http://${google_compute_address.lms_static_ip.address}"
}

output "prometheus_url" {
  description = "URL to access Prometheus"
  value       = "http://${google_compute_address.lms_static_ip.address}:9090"
}

output "grafana_url" {
  description = "URL to access Grafana"
  value       = "http://${google_compute_address.lms_static_ip.address}:9010"
}