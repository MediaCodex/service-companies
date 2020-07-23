resource "aws_lambda_function" "http_create" {
  function_name = "companies-http-create"
  role          = aws_iam_role.lambda_http_create.arn

  // handler
  source_code_hash = filebase64sha256("../build/http-create.js.zip")
  filename         = "../build/http-create.js.zip"
  handler          = "lumigo-auto-instrument.handler"

  // runtime
  runtime = "nodejs12.x"
  timeout = "15"
  layers  = [var.lumigo_layer]

  environment {
    variables = {
      LUMIGO_TRACER_TOKEN     = var.lumigo_token
      LUMIGO_ORIGINAL_HANDLER = "http-create.default"
    }
  }

  tags = var.default_tags
}

resource "aws_iam_role" "lambda_http_create" {
  name               = "companies-http-create"
  path               = "/lambda/"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

/*
 * Permissions
 */
module "lambda_http_create_dynamodb" {
  source = "./modules/iam-dynamodb"
  role   = aws_iam_role.lambda_http_create.id
  table  = aws_dynamodb_table.companies.arn
  write  = true
}

module "lambda_http_create_cloudwatch" {
  source = "./modules/iam-cloudwatch"
  role   = aws_iam_role.lambda_http_create.id
  name   = "companies-http-create"
}

/*
 * Gateway
 */
resource "aws_apigatewayv2_route" "create" {
  api_id    = data.terraform_remote_state.core.outputs.gateway_id
  route_key = "POST /companies"
  target    = "integrations/${aws_apigatewayv2_integration.create.id}"
  authorizer_id = data.terraform_remote_state.core.outputs.authorizer
  authorization_type = "JWT"
}

resource "aws_apigatewayv2_integration" "create" {
  api_id                 = data.terraform_remote_state.core.outputs.gateway_id
  integration_type       = "AWS_PROXY"
  payload_format_version = "2.0"
  connection_type        = "INTERNET"
  integration_method     = "POST"
  integration_uri        = aws_lambda_function.http_create.invoke_arn
}
