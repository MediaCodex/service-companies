locals {
  environment = lookup(var.environments, terraform.workspace, "dev")
  uri_prefix  = contains(keys(var.environments), terraform.workspace) ? "" : "-${terraform.workspace}"
  firebase_project = lookup(var.firebase_projects, local.environment)
}

/**
 * Terraform
 */
variable "terraform_state" {
  type = map(string)
  default = {
    bucket = "arn:aws:s3:::terraform-state-mediacodex"
    dynamo = "arn:aws:dynamodb:eu-central-1:939514526661:table/terraform-state-lock"
  }
}

variable "environments" {
  type = map(string)
  default = {
    dev = "dev"
    prod  = "prod"
  }
}

/**
 * AWS
 */
variable "default_tags" {
  type        = map(string)
  description = "Common resource tags for all resources"
  default = {
    Service = "companies"
  }
}


/**
 * Lumigo
 */
variable "lumigo_layer" {
  type    = string
  default = "arn:aws:lambda:us-east-1:114300393969:layer:lumigo-node-tracer:115"
}

variable "lumigo_token" {
  type    = string
  default = ""
}

/**
 * Cors
 */
variable "cors_origins" {
  type = map(list(string))
  default = {
    dev  = ["*"]
    prod = ["https://mediacodex.net"]
  }
}

variable "cors_expose" {
  type = map(list(string))
  default = {
    dev  = ["*"]
    prod = []
  }
}

/**
 * Firebase
 */
variable "firebase_projects" {
  type = map(string)
  default = {
    "dev"  = "mediacodex-dev"
    "prod" = "mediacodex-prod"
  }
}

/**
 * Toggles
 */
variable "first_deploy" {
  type        = bool
  description = "Disables some resources that depend on other services being deployed"
  default     = false
}

