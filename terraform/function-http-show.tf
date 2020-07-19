resource "aws_lambda_function" "http_show" {
  function_name = "companies-http-show"
  role          = aws_iam_role.lambda_http_show.arn

  // handler
  source_code_hash = filebase64sha256("../build/http-show.js.zip")
  filename         = "../build/http-show.js.zip"
  handler          = "lumigo-auto-instrument.handler"

  // runtime
  runtime = "nodejs12.x"
  timeout = "15"
  layers  = [var.lumigo_layer]

  environment {
    variables = {
      LUMIGO_TRACER_TOKEN     = var.lumigo_token
      LUMIGO_ORIGINAL_HANDLER = "http-show.default"
    }
  }

  tags = var.default_tags
}

resource "aws_iam_role" "lambda_http_show" {
  name               = "companies-http-show"
  path               = "/lambda/"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

/*
 * Permissions
 */
module "lambda_http_show_dynamodb" {
  source = "./modules/iam-dynamodb"
  role   = aws_iam_role.lambda_http_show.id
  table  = aws_dynamodb_table.companies.arn
  read   = true
}

module "lambda_http_show_cloudwatch" {
  source = "./modules/iam-cloudwatch"
  role   = aws_iam_role.lambda_http_show.id
  name   = "companies-http-show"
}

/*
 * Gateway
 */
resource "aws_apigatewayv2_route" "show" {
  api_id    = data.terraform_remote_state.core.outputs.gateway_id
  route_key = "GET /companies/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.show.id}"
}

resource "aws_apigatewayv2_integration" "show" {
  api_id                 = data.terraform_remote_state.core.outputs.gateway_id
  integration_type       = "AWS_PROXY"
  payload_format_version = "2.0"
  connection_type        = "INTERNET"
  integration_method     = "POST"
  integration_uri        = aws_lambda_function.http_show.invoke_arn
}
