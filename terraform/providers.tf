terraform {
  backend "remote" {
    hostname = "app.terraform.io"
    organization = "MediaCodex"

    workspaces {
      prefix = "service-companies"
    }
  }
}

variable "deploy_aws_roles" {
  type = map(string)
  default = {
    dev  = "arn:aws:iam::949257948165:role/deploy-companies"
    prod = "arn:aws:iam::000000000000:role/deploy-companies"
  }
}

variable "deploy_aws_accounts" {
  type = map(list(string))
  default = {
    dev  = ["949257948165"]
    prod = ["000000000000"]
  }
}

provider "aws" {
  region              = "eu-central-1"
  allowed_account_ids = var.deploy_aws_accounts[local.environment]
  assume_role {
    role_arn = var.deploy_aws_roles[local.environment]
  }
}
data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

data "terraform_remote_state" "core" {
  backend   = "s3"
  workspace = terraform.workspace
  config = {
    bucket       = "terraform-state-mediacodex"
    key          = "core.tfstate"
    region       = "eu-central-1"
    role_arn     = "arn:aws:iam::939514526661:role/remotestate/website"
    session_name = "terraform"
  }
}

