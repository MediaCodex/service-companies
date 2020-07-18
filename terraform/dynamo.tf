resource "aws_dynamodb_table" "companies" {
  name         = "companies"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = var.default_tags
}