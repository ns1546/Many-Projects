# FAANG-TIER: GLOBALLY DISTRIBUTED SQL DATABASE (ACTIVE-ACTIVE)
# Tool: Terraform >= 1.5.0
# Provider: Google Cloud Platform (GCP)
# Why: Standard AWS RDS PostgreSQL cannot do Global Active-Active writes. Google Spanner uses TrueTime (Atomic Clocks) to achieve global consistency.

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = "evorise-hyperscale-prod"
}

# 1. SPANNER INSTANCE (Global Active-Active)
# This spans 3 continents. It survives the destruction of entire geographic regions.
resource "google_spanner_instance" "global_order_db" {
  name         = "evorise-global-db"
  config       = "nam-eur-asia1" # North America, Europe, and Asia
  display_name = "Evorise Global Transaction Ledger"
  
  # Facebook/Google scale: 10,000 compute nodes
  # capable of millions of QPS (Queries Per Second)
  num_nodes    = 10000 
  
  labels = {
    environment = "production"
    tier        = "hyperscale"
  }
}

# 2. SPANNER DATABASE (PostgreSQL Dialect)
resource "google_spanner_database" "orders" {
  instance = google_spanner_instance.global_order_db.name
  name     = "evorise_orders"
  
  # Spanner now supports the Postgres wire protocol and SQL syntax
  database_dialect = "POSTGRESQL"
  
  # Prevent accidental deletion of the entire company's data
  deletion_protection = true
}

# 3. IDENTITY & ACCESS MANAGEMENT (Zero Trust)
# Microservices assume this role via Workload Identity (No long-lived passwords)
resource "google_spanner_database_iam_binding" "order_service_access" {
  instance = google_spanner_instance.global_order_db.name
  database = google_spanner_database.orders.name
  role     = "roles/spanner.databaseUser"

  members = [
    "serviceAccount:order-engine@evorise-hyperscale-prod.iam.gserviceaccount.com",
  ]
}
