variable "name" {}
variable "location" {}
variable "deletion_protection" {}
variable "ingress" {}
variable "min_instance_count" {}
variable "max_instance_request_concurrency" {}
variable "max_instance_count" {}
variable "traffic" {
  type = list(object({
    traffic_type         = string
    traffic_type_percent = string
  }))
}
variable "service_account" {}
variable "volumes" {
  type = list(object({
    name               = string
    cloud_sql_instance = list(string)
  }))
}
variable "containers" {
  type = list(object({
    image = string
    cpu_idle = bool
    startup_cpu_boost = bool
    env = list(object({
      name  = string
      value = string
      value_source = list(object({
        secret_key_ref = list(object({
          secret  = string
          version = string
        }))
      }))
    }))
    volume_mounts = list(object({
      name       = string
      mount_path = string
    }))
  }))
}
