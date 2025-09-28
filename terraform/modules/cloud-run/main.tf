data "google_project" "project" {}
locals {
  port = 3000
}
resource "google_cloud_run_v2_service" "cloud_run_service" {
  name                = var.name
  location            = var.location
  deletion_protection = var.deletion_protection
  ingress             = var.ingress
  template {
    service_account = var.service_account
    max_instance_request_concurrency = var.max_instance_request_concurrency
    scaling {
      max_instance_count = var.max_instance_count
      min_instance_count = var.min_instance_count
    }
    dynamic "volumes" {
      for_each = var.volumes
      content {
        name = volumes.value["name"]
        cloud_sql_instance {
          instances = volumes.value["cloud_sql_instance"]
        }
      }
    }    
    dynamic "containers" {      
      for_each = var.containers
      content {
        image = containers.value["image"]
        resources {          
          cpu_idle = containers.value["cpu_idle"]
          startup_cpu_boost = containers.value["startup_cpu_boost"]
        }
        ports {
          container_port = local.port
        }
        dynamic "volume_mounts" {
          for_each = containers.value["volume_mounts"]
          content {
            name       = volume_mounts.value["name"]
            mount_path = volume_mounts.value["mount_path"]
          }
        }
        dynamic "env" {
          for_each = containers.value["env"]
          content {
            name  = env.value["name"]
            value = env.value["value"]
            dynamic "value_source" {
              for_each = env.value["value_source"]
              content {
                dynamic "secret_key_ref" {
                  for_each = value_source.value["secret_key_ref"]
                  content {
                    secret  = secret_key_ref.value["secret"]
                    version = secret_key_ref.value["version"]
                  }
                }
              }
            }
          }
        }
      }
    }
  }  
  dynamic "traffic" {
    for_each = var.traffic
    content {
      type    = traffic.value["traffic_type"]
      percent = traffic.value["traffic_type_percent"]
    }
  }
}
