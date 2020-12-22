import Joi from '@hapi/joi'
import bodyParser from 'koa-bodyparser'
import { wrapper, nanoid } from '../../helpers'
import defaultMiddleware, { validateBody, auth } from '../../middleware'
import Company from '../../models/company'

/**
 * Request validation
 *
 * TODO: confirm remote IDs, normalise
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
  const item = {
    ...ctx.request.body,
    id: nanoid(),
    created_by: ctx.state.userId,
    created_at: (new Date()).toISOString()
  }

  const slug = await Company.slugExists(item.slug, null)
  if (slug) {
    ctx.throw(400, 'Slug already in use')
  }

  await Company.create(item)
  ctx.body = { id: item.id }
  ctx.status = 201
}

/**
 * Wrap Koa in Lambda-compatible IO and export
 */
export default wrapper(handler, ...defaultMiddleware, ...middleware)
