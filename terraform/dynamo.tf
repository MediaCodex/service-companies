resource "aws_dynamodb_table" "companies" {
  name         = "companies"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "slug"
    type = "S"
  }

  global_secondary_index {
    name               = "slug"
    hash_key           = "slug"
    projection_type    = "INCLUDE"
    non_key_attributes = ["id"]
  }

  tags = var.default_tags
}