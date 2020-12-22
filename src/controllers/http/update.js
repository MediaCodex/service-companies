import Joi from '@hapi/joi'
import bodyParser from 'koa-bodyparser'
import { wrapper } from '../../helpers'
import defaultMiddleware, { validateBody, auth } from '../../middleware'
import Company from '../../models/company'

/**
 * Request validation
 *
 * @constant {Joi.Schema} validation
 */
const requestSchema = Joi.object({
  name: Joi.string().min(3).max(255).required().trim(),
  slug: Joi.string().min(3).max(501).regex(/^[a-zA-Z0-9-]+$/).required(), // 512 chars, accounting for ID
  founded: Joi.string().isoDate()
}).required()

/**
 * Koa Middleware
 *
 * @constant {Array<import('koa').Middleware>} middleware
 */
export const middleware = [
  auth,
  bodyParser(),
  validateBody(requestSchema)
]

/**
 * Function logic
 *
 * @param {Koa.Context} ctx
 */
export const handler = async (ctx) => {
  const path = ctx.path.split('/')
  const id = path[path.length - 1]

  const item = {
    ...ctx.request.body,
    updated_by: ctx.state.userId,
    updated_at: (new Date()).toISOString()
  }

  const slug = await Company.slugExists(item.slug, id)
  if (slug) {
    ctx.throw(400, 'Slug already in use')
  }

  await Company.update({ id }, item)
  ctx.body = { id }
  ctx.status = 200
}

/**
 * Wrap Koa in Lambda-compatible IO and export
 */
export default wrapper(handler, ...defaultMiddleware, ...middleware)
