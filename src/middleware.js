import jsonError from 'koa-json-error'
import * as R from 'ramda'

/**
 * Validate request body, or return validation-failed response
 *
 * @param {import('@hapi/joi').Schema} schema
 * @param {import('@hapi/joi').ValidationOptions} options
 * @returns {import('koa').Middleware}
 */
export const validateBody = (schema, options) => async function validator (ctx, next) {
  let validated; try {
    validated = await schema.validateAsync(ctx.request.body, { abortEarly: false, stripUnknown: true, ...options })
  } catch (error) {
    if (error.name !== 'ValidationError') throw error
    const removeValues = (field) => { delete field.context.value; return field }
    error.details.map(removeValues)
    ctx.body = { error: 'ValidationError', fields: error.details }
    ctx.status = 400
    return
  }

  ctx.request.body = validated
  await next()
}

/**
 * Apply default middlewares
 *
 * @param {import('koa').Koa} app
 */
export const applyDefaults = (app) => {
  const isProd = () => process.env.NODE_ENV === 'production'

  // format error as JSON, omit stacktrace in prod
  app.use(jsonError({
    postFormat: (e, obj) => {
      const omit = R.omit(['stack'])
      const toObj = R.compose((arr) => ({ ...arr }), R.split('\n    '))
      const format = R.evolve({ stack: toObj })
      return R.ifElse(isProd, omit, format)(obj)
    }
  }))
}
