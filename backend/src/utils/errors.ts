export function createError(message: string, status: number): Error & { status: number } {
  const err = new Error(message) as Error & { status: number }
  err.status = status
  return err
}

export function unauthorized(message = 'Unauthorized') {
  return createError(message, 401)
}

export function forbidden(message = 'Forbidden') {
  return createError(message, 403)
}

export function notFound(message = 'Not found') {
  return createError(message, 404)
}

export function badRequest(message: string) {
  return createError(message, 400)
}

export function conflict(message: string) {
  return createError(message, 409)
}

export function serviceUnavailable(message: string) {
  return createError(message, 503)
}
