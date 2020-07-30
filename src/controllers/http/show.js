import { wrapper } from '../../helpers'
import defaultMiddleware from '../../middleware'
import Company from '../../models/company'

/**
 * Koa Middleware
 *
 * @constant {Array<import('koa').Middleware>} middleware
 */
export const middleware = []

/**
 * Function logic
 *
 * @param {Koa.Context} ctx
 */
export const handler = async (ctx) => {
  const bySlug = !!ctx.query.slug
  const path = ctx.path.split('/')
  const id = path[path.length - 1]

  if (!id) {
    ctx.throw(400, `${bySlug ? 'Slug' : 'ID'} required`)
  }

  const company = await (bySlug ? Company.getBySlug(id) : Company.get(id))

  if (!company) {
    ctx.throw(404, 'Company not found')
  }

  ctx.body = company
  ctx.status = 200
}

/**
 * Wrap Koa in Lambda-compatible IO and export
 */
export default wrapper([handler, ...defaultMiddleware, ...middleware])
