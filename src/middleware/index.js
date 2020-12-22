import jsonError from './jsonError'
import baseAuth from 'koa-serverless-auth'

// set auth provider
export const auth = baseAuth({ provider: 'firebase' })

// default middlewares
export default [jsonError()]

// re-export middelwares that don't require modification
export { default as validateBody } from './validateBody'
