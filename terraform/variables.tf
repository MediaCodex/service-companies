locals {
  environment = lookup(var.environments, terraform.workspace, "dev")
  uri_prefix  = lookup(keys(var.environments), terraform.workspace, "${terraform.workspace}-")
  firebase_project = lookup(var.firebase_projects, local.environment)
}

variable "environments" {
  type = map(string)
  default = {
    dev = "dev"
    prod  = "prod"
  }
}

variable "default_tags" {
  type        = map(string)
  description = "Common resource tags for all resources"
  default = {
    Service = "companies"
  }
}

variable "terraform_state" {
  type = map(string)
  default = {
    bucket = "arn:aws:s3:::terraform-state-mediacodex"
    dynamo = "arn:aws:dynamodb:eu-central-1:939514526661:table/terraform-state-lock"
  }
}

variable "lumigo_layer" {
  type    = string
  default = "arn:aws:lambda:eu-central-1:114300393969:layer:lumigo-node-tracer:115"
}

variable "lumigo_token" {
  type    = string
  default = ""
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
variable "first_deploy" {
  type        = bool
  description = "Disables some resources that depend on other services being deployed"
  default     = false
}

