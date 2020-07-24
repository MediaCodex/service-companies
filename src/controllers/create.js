import Koa from 'koa'
import Joi from '@hapi/joi'
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

/**
 * Request validation
 *
 * TODO: confirm remote IDs, normalise
 *
 * @constant {Joi.Schema} validation
 */
const requestSchema = Joi.object({
  name: Joi.string().min(3).max(255).required().trim(),
  slug: Joi.string().min(3).max(502).regex(/^[a-zA-Z0-9-]+$/).required() // 512 chars, accounting for ID
}).required()
app.use(validateBody(requestSchema))

/**
 * Function logic
 *
 * @param {Koa.Context} ctx
 */
const handler = async (ctx) => { 
  const id = nanoid()
  await Company.create({ ...ctx.request.body, id })
  ctx.body = { id }
  ctx.status = 201
}

/**
 * Wrap Koa in Lambda-compatible IO and export
 */
app.use(handler)
export default wrapper(app)
