# Getting project information
data "google_project" "project" {}

#---------------------------------------------------------------
# APIs
#---------------------------------------------------------------

module "apis" {
  source = "../modules/apis"
  apis = [
    "servicenetworking.googleapis.com",
    "vpcaccess.googleapis.com",
    "compute.googleapis.com",
    "secretmanager.googleapis.com",
    "artifactregistry.googleapis.com",
    "run.googleapis.com",
    "cloudfunctions.googleapis.com",
    "eventarc.googleapis.com",
    "sqladmin.googleapis.com",
    "binaryauthorization.googleapis.com",
    "storagetransfer.googleapis.com"
  ]
  disable_on_destroy = false
  project_id         = data.google_project.project.project_id
}

#---------------------------------------------------------------
# VPC Configuration
#---------------------------------------------------------------

module "vpc" {
  source                          = "../modules/vpc"
  vpc_name                        = "vpc"
  delete_default_routes_on_create = false
  auto_create_subnetworks         = false
  routing_mode                    = "REGIONAL"
  region                          = var.location
  subnets = [
    {
      name                     = "db-subnet"
      region                   = "${var.location}"
      purpose                  = "PRIVATE"
      role                     = "ACTIVE"
      private_ip_google_access = true
      ip_cidr_range            = "10.1.0.0/24"
    }
  ]
  firewall_data = [
    {
      name          = "vpc-firewall-ssh"
      source_ranges = ["0.0.0.0/0"]
      allow_list = [
        {
          protocol = "tcp"
          ports    = ["22"]
        }
      ]
    },
    {
      name          = "vpc-firewall-http"
      source_ranges = ["0.0.0.0/0"]
      allow_list = [
        {
          protocol = "tcp"
          ports    = ["80"]
        }
      ]
    },
  ]
}

#---------------------------------------------------------------
# Secrets Manager
#---------------------------------------------------------------

module "db_sql_password_secret" {
  source      = "../modules/secret-manager"
  secret_data = tostring(data.vault_generic_secret.sql.data["password"])
  secret_id   = "db_password_secret"
  depends_on  = [module.apis]
}

module "db_sql_username_secret" {
  source      = "../modules/secret-manager"
  secret_data = tostring(data.vault_generic_secret.sql.data["username"])
  secret_id   = "db_username_secret"
  depends_on  = [module.apis]
}

#---------------------------------------------------------------
# Cloud Storage
#---------------------------------------------------------------

module "carshub_media_bucket_code" {
  source   = "../modules/gcs"
  location = var.location
  name     = "carshub-media-code"
  cors     = []
  contents = [
    {
      name        = "carshub_media_function_code.zip"
      source_path = "${path.root}/../../../files/carshub_media_function_code.zip"
      content     = ""
    }
  ]
  force_destroy               = true
  uniform_bucket_level_access = true
}

#---------------------------------------------------------------
# Cloud SQL
#---------------------------------------------------------------

module "db" {
  source                      = "../modules/cloud-sql"
  name                        = "db-instance"
  db_name                     = "db"
  db_user                     = module.db_sql_username_secret.secret_data
  db_version                  = "MYSQL_8_0"
  location                    = var.location
  tier                        = "db-custom-2-8192"
  availability_type           = "REGIONAL"
  disk_size                   = 100 # GB
  disk_type                   = "PD_SSD"
  disk_autoresize             = true
  disk_autoresize_limit       = 500 # GB
  ipv4_enabled                = false
  deletion_protection_enabled = false
  backup_configuration = [
    {
      enabled                        = true
      binary_log_enabled             = true
      start_time                     = "03:00"
      location                       = "${var.location}"
      point_in_time_recovery_enabled = false
      backup_retention_settings = [
        {
          retained_backups = 30
          retention_unit   = "COUNT"
        }
      ]
    }
  ]
  database_flags = [
    {
      name  = "max_connections"
      value = "1000"
    },
    {
      name  = "skip_show_database"
      value = "on"
    }
  ]
  vpc_self_link = module.vpc.self_link
  vpc_id        = module.vpc.vpc_id
  password      = module.db_sql_password_secret.secret_data
  depends_on    = [module.db_sql_password_secret]
}

#---------------------------------------------------------------
# Artifact Registry
#---------------------------------------------------------------

module "frontend_artifact_registry" {
  source        = "../modules/artifact-registry"
  location      = var.location
  description   = "frontend code repository"
  repository_id = "frontend-repo"
  shell_command = "bash ${path.cwd}/../src/frontend/artifact_push.sh ${data.google_project.project.project_id} ${var.location}"
}

module "backend_artifact_registry" {
  source        = "../modules/artifact-registry"
  location      = var.location
  description   = "backend code repository"
  repository_id = "backend-repo"
  shell_command = "bash ${path.cwd}/../src/backend/artifact_push.sh ${data.google_project.project.project_id} ${var.location}"
}

#---------------------------------------------------------------
# Cloud Run Services
#---------------------------------------------------------------

module "frontend_service" {
  source                           = "./modules/cloud-run"
  deletion_protection              = false
  ingress                          = "INGRESS_TRAFFIC_ALL"
  service_account                  = module.cloud_run_service_account.sa_email
  location                         = "${var.location}"
  min_instance_count               = 2
  max_instance_count               = 5
  max_instance_request_concurrency = 80
  name                             = "frontend-service"
  volumes                          = []
  traffic = [
    {
      traffic_type         = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
      traffic_type_percent = 100
    }
  ]
  containers = [
    {
      port              = 3000
      env               = []
      volume_mounts     = []
      cpu_idle          = true
      startup_cpu_boost = true
      image             = "${var.location}-docker.pkg.dev/${data.google_project.project.project_id}/frontend-service/frontend-service:latest"
    }
  ]
  depends_on = [module.frontend_artifact_registry]
}

module "backend_service" {
  source                           = "./modules/cloud-run"
  deletion_protection              = false
  ingress                          = "INGRESS_TRAFFIC_ALL"
  service_account                  = module.cloud_run_service_account.sa_email
  location                         = "${var.location}"
  min_instance_count               = 2
  max_instance_count               = 5
  max_instance_request_concurrency = 80
  name                             = "backend-service"
  volumes                          = []
  traffic = [
    {
      traffic_type         = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
      traffic_type_percent = 100
    }
  ]
  containers = [
    {
      port              = 5000
      env               = []
      volume_mounts     = []
      cpu_idle          = true
      startup_cpu_boost = true
      image             = "${var.location}-docker.pkg.dev/${data.google_project.project.project_id}/backend-service/backend-service:latest"
    }
  ]
  depends_on = [module.backend_artifact_registry]
}