import jsonError from 'koa-json-error'
import * as R from 'ramda'

/**
 * Format error as JSON, omit stacktrace in prod
 *
 * @param {Boolean} [isProd]
 */
export default (isProd = true) => jsonError({
  postFormat: (e, obj) => {
    const omit = R.omit(['stack'])
    const toObj = R.compose((arr) => ({ ...arr }), R.split('\n    '))
    const format = R.evolve({ stack: toObj })
    return R.ifElse(isProd, omit, format)(obj)
  }
})
