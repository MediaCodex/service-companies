resource "aws_lambda_function" "dynamodb_companies" {
  function_name = "companies-dynamodb-companies"
  role          = aws_iam_role.lambda_dynamodb_companies.arn

  // handler
  source_code_hash = filebase64sha256("../build/dynamodb-companies.js.zip")
  filename         = "../build/dynamodb-companies.js.zip"
  handler          = "lumigo-auto-instrument.handler"

  // runtime
  runtime = "nodejs12.x"
  timeout = "15"
  layers  = [var.lumigo_layer]

  environment {
    variables = {
      LUMIGO_TRACER_TOKEN     = var.lumigo_token
      LUMIGO_ORIGINAL_HANDLER = "dynamodb-companies.default"
    }
  }

  tags = var.default_tags
}

resource "aws_iam_role" "lambda_dynamodb_companies" {
  name               = "companies-dynamodb-companies"
  path               = "/lambda/"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_lambda_event_source_mapping" "dynamodb_companies" {
  event_source_arn  = aws_dynamodb_table.companies.stream_arn
  function_name     = aws_lambda_function.dynamodb_companies.function_name
  starting_position = "LATEST"
  batch_size        = 10 // EventBridge limit

  // error handling
  maximum_retry_attempts         = 3
  maximum_record_age_in_seconds  = 300
  bisect_batch_on_function_error = true
}

/*
 * Permissions
 */
module "lambda_dynamodb_companies_dynamodb" {
  source = "./modules/iam-dynamodb"
  role   = aws_iam_role.lambda_dynamodb_companies.id
  table  = aws_dynamodb_table.companies.arn
  stream = true
}

module "lambda_dynamodb_companies_cloudwatch" {
  source = "./modules/iam-cloudwatch"
  role   = aws_iam_role.lambda_dynamodb_companies.id
  name   = "companies-dynamodb-companies"
}

resource "aws_iam_role_policy" "eventbridge" {
  name   = "Eventbridge"
  role   = aws_iam_role.lambda_dynamodb_companies.id
  policy = data.aws_iam_policy_document.eventbridge.json
}

data "aws_iam_policy_document" "eventbridge" {
  statement {
    sid = "PublishEvents"
    actions = [
      "events:PutEvents"
    ]
    resources = [
      "arn:aws:events:eu-central-1:949257948165:event-bus/default"
    ]
  }
}
