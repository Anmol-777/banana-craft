import { ApiError } from '../utils/ApiError.js';

function run(schema, value, location) {
  const result = schema.safeParse(value ?? {});
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: [location, ...issue.path].join('.'),
      message: issue.message,
    }));
    throw ApiError.unprocessable(`Invalid ${location}`, { code: 'VALIDATION_ERROR', details });
  }
  return result.data;
}

export const validate = ({ body, query, params } = {}) => (req, _res, next) => {
  try {
    req.validated = {
      ...(req.validated ?? {}),
      ...(params ? { params: run(params, req.params, 'params') } : {}),
      ...(query ? { query: run(query, req.query, 'query') } : {}),
      ...(body ? { body: run(body, req.body, 'body') } : {}),
    };
    next();
  } catch (error) {
    next(error);
  }
};

export const validateBody = (schema) => validate({ body: schema });
export const validateQuery = (schema) => validate({ query: schema });
export const validateParams = (schema) => validate({ params: schema });
