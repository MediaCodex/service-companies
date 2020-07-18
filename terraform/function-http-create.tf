resource "aws_lambda_function" "http_create" {
  function_name = "companies-http-create"
  role          = aws_iam_role.lambda_http_create.arn

  // handler
  source_code_hash = filebase64sha256("../build/http-create.zip")
  filename         = "../build/http-create.zip"
  handler          = "http-create.handler"

  // runtime
  runtime = "nodejs12.x"

  tags = var.default_tags
}

resource "aws_iam_role" "lambda_http_create" {
  name               = "companies-http-create"
  path               = "/lambda/"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

module "lambda_http_create_dynamodb" {
  source = "./modules/iam-dynamodb"
  role   = aws_iam_role.lambda_http_create.id
  table  = aws_dynamodb_table.companies.arn
  write  = true
}
