import Koa from 'koa'
import Joi from '@hapi/joi'
import auth from 'koa-serverless-auth'
import bodyParser from 'koa-bodyparser'
import { wrapper } from '../../helpers'
import { validateBody, applyDefaults } from '../../middleware'
import Company from '../../models/company'

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
app.use(handler)
export default wrapper(app)
