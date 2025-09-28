output "frontend_url" {
  value       = module.frontend_service.service_uri
  description = "The URL of the frontend service"
}

output "backend_url" {
  value       = module.backend_service.service_uri
  description = "The URL of the backend service"
}