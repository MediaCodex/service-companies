# Companies service

[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=MediaCodex_service-companies&metric=coverage)](https://sonarcloud.io/dashboard?id=MediaCodex_service-companies)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=MediaCodex_service-companies&metric=bugs)](https://sonarcloud.io/dashboard?id=MediaCodex_service-companies)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=MediaCodex_service-companies&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=MediaCodex_service-companies)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=MediaCodex_service-companies&metric=alert_status)](https://sonarcloud.io/dashboard?id=MediaCodex_service-companies)

## First deployment

While this should always be the first service to be instantiated in a new environment, and for the most part it will work just fine since
most of the resources are defined in such a way as to be independent of other services to avoid race-conditions. However, there are a few
resources that reply on the outputs from other services, as such they cannot be created without causing a lovely chicken-and-egg scenario
for the order in which to deploy said services.

To make life significantly easier any resources that rely on sub-services can be disabled by changing a single variable to `true`, while
this does force you to deploy this repo twice for a new cloud, that in significantly less effort than any alternatives. The variable can
even be set via the CI env so you don't have to commit any changes, just run the pipeline twice.

| Default value | TF Var         | Env Var               |
| ------------- | -------------- | --------------------- |
| `false`       | `first_deploy` | `TF_VAR_first_deploy` |


## URI Prefix

If the current workspace is not on of the known environments (e.g. dev/prod) then the HTTP URI will be prefixed witht he workspace name,
for example a workspace of `test` would result in a public URI of `https://api.mediacodex.dev/v1/test-companies/`.