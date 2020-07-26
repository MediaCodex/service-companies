import Koa from 'koa'
import { wrapper } from '../helpers'
import { applyDefaults } from '../middleware'
import Company from '../models/company'

/**
 * Initialise Koa
 */
const app = new Koa()
applyDefaults(app)

/**
 * Function logic
 *
 * @param {Koa.Context} ctx
 */
const handler = async (ctx) => {
  // get params from query, or headers, or default value
  const rawLimit = ctx.query.limit || ctx.request.get('X-Pagination-Limit') || 50
  const token = ctx.query.token || ctx.request.get('X-Pagination-Token') || undefined

  // parse limit and check not too high
  const limit = Number.parseInt(rawLimit, 10)
  if (Number.isNaN(limit) || limit > 1000) {
    ctx.throw(400, 'Limit is too high, or NaN')
  }

  // list all companies
  const query = Company.scan().limit(limit)
  if (token) query.lastKey(token)
  const companies = await query.exec()

  // set pagination headers
  ctx.set('X-Pagination-Count', companies.count)
  ctx.set('X-Pagination-Token', companies.lastKey)

  // return data
  ctx.body = companies
  ctx.status = 200
}

/**
 * Wrap Koa in Lambda-compatible IO and export
 */
app.use(handler)
export default wrapper(app)
