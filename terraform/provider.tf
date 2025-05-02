terraform {
  required_version = ">= 1.3.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  backend "gcs" {
    bucket = "your-terraform-state-bucket"  # replace this with your GCS bucket name
    prefix = "terraform/state"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}
