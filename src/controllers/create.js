import Koa from 'koa'
import Joi from '@hapi/joi'
import auth from 'koa-serverless-auth'
import bodyParser from 'koa-bodyparser'
import { wrapper, nanoid } from '../helpers'
import { validateBody, applyDefaults } from '../middleware'
import Company from '../models/company'

/**
 * Initialise Koa
 */
const app = new Koa()
app.use(bodyParser())
applyDefaults(app)
app.use(auth)

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
app.use(validateBody(requestSchema))

/**
 * Function logic
 *
 * @param {Koa.Context} ctx
 */
const handler = async (ctx) => {
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
app.use(handler)
export default wrapper(app)
