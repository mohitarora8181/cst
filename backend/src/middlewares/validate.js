import { ApiError } from '../utils/ApiError.js';

/**
 * Validates and replaces req.body / req.query / req.params with the parsed (coerced, stripped) value.
 * Usage: validate({ body: schema, query: schema })
 */
export const validate = (schemas) => (req, _res, next) => {
  for (const part of ['params', 'query', 'body']) {
    const schema = schemas[part];
    if (!schema) continue;
    const result = schema.safeParse(req[part] ?? {});
    if (!result.success) {
      const details = result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
      const first = details[0];
      return next(ApiError.badRequest(first ? `${first.path || part}: ${first.message}` : 'Invalid input', details));
    }
    // req.query is a getter in newer Express versions — define instead of assign
    Object.defineProperty(req, part, { value: result.data, writable: true, configurable: true, enumerable: true });
  }
  next();
};
