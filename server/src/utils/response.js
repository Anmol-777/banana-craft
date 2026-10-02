export function sendData(res, data, { status = 200, meta } = {}) {
  const body = { success: true, data };
  if (meta !== undefined) body.meta = meta;
  return res.status(status).json(body);
}

export function sendCreated(res, data) {
  return sendData(res, data, { status: 201 });
}

export function sendNoContent(res) {
  return res.status(204).end();
}

export function resolvePagination(query = {}, { defaultLimit = 20, maxLimit = 100 } = {}) {
  const page = Math.max(1, Number.parseInt(String(query.page ?? '1'), 10) || 1);
  const requested = Number.parseInt(String(query.limit ?? defaultLimit), 10) || defaultLimit;
  const limit = Math.min(Math.max(1, requested), maxLimit);
  return { page, limit, skip: (page - 1) * limit };
}

export function buildPageMeta({ total, page, limit }) {
  return {
    total,
    page,
    limit,
    pages: limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1,
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
}
