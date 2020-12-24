resource "aws_apigatewayv2_api" "public" {
  name          = "public-companies"
  protocol_type = "HTTP"

  disable_execute_api_endpoint = true

  cors_configuration {
    allow_headers  = ["*"]
    allow_methods  = ["*"]
    allow_origins  = lookup(var.cors_origins, local.environment)
    expose_headers = lookup(var.cors_expose, local.environment)
  }

  tags = var.default_tags
}

resource "aws_apigatewayv2_stage" "v1" {
  api_id      = aws_apigatewayv2_api.public.id
  name        = "v1"
  auto_deploy = true

  // required due to bug https://github.com/hashicorp/terraform-provider-aws/issues/14742#issuecomment-750693332
  default_route_settings {
    throttling_burst_limit = 100
    throttling_rate_limit  = 50
  }

  lifecycle {
    // auto-deploy changes this
    ignore_changes = [deployment_id]
  }

  tags = var.default_tags
}

resource "aws_apigatewayv2_authorizer" "public" {
  api_id           = aws_apigatewayv2_api.public.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "firebase"

  jwt_configuration {
    issuer   = "https://securetoken.google.com/${local.firebase_project}"
    audience = [local.firebase_project]
  }
}

/**
 * Domain
 */
data "aws_ssm_parameter" "gateway_public_domain" {
  name = "/gateway-public/domain"
}

resource "aws_apigatewayv2_api_mapping" "public" {
  api_id          = aws_apigatewayv2_api.public.id
  domain_name     = data.aws_ssm_parameter.gateway_public_domain.value
  stage           = aws_apigatewayv2_stage.v1.id
  api_mapping_key = "v1${local.uri_prefix}"
}