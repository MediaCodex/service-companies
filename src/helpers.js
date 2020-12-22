import Koa from 'koa'
import serverless from 'serverless-http'
import { customAlphabet } from 'nanoid'
import nolookalikes from 'nanoid-dictionary/nolookalikes'

/**
 * @param {Koa.Middleware} handler Http handler
 * @param {...Koa.Middleware} middlewares Koa middleware
 */
export const wrapper = (handler, ...middlewares) => {
  // init new koa instance
  const app = new Koa()

  // apply middleware
  for (const middleware of middlewares) {
    app.use(middleware)
  }

  // bind handler
  app.use(handler)

  // wrap koa for lambda
  return async (event, context) => {
    return serverless(app)(event, context)
  }
}

/**
 * Generate a short ID for use as a primary key
 *
 * @returns {string}
 */
export const nanoid = customAlphabet(nolookalikes, 10)

/**
 * Converts Epoch timestamp integer to ISO8601 string
 *
 * @param {Number} timestamp
 * @returns {String}
 */
export const epochToIso = (timestamp) => new Date(timestamp).toISOString()