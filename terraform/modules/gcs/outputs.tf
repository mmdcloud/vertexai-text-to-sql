output "bucket_name" {
  value = google_storage_bucket.bucket.name
}

output "object_name" {
  value = var.contents
}
