import type { FastifyReply, FastifyRequest } from "fastify"

export const setAuthCookies = (
  reply: FastifyReply,
  accessToken: string,
  refreshToken: string,
  isProduction: boolean
) => {
  const sameSite = isProduction ? 'strict' : 'lax'

  reply.setCookie('accessToken', accessToken, {
    path: '/',
    httpOnly: true,
    secure: isProduction,
    sameSite,
    maxAge: 900
  })
  reply.setCookie('refreshToken', refreshToken, {
    path: '/',
    httpOnly: true,
    secure: isProduction,
    sameSite,
    maxAge: 604800
  })
}

export const clearAuthCookies = async (reply: FastifyReply) => {
  reply.clearCookie('accessToken', { path: '/' })
  reply.clearCookie('refreshToken', { path: '/' })
}

export function getRefreshToken(request: FastifyRequest): string {
  const cookieToken = request.cookies.refreshToken
  const body = request.body as Record<string, unknown> | undefined
  const bodyToken = typeof body?.refreshToken === "string" ? body.refreshToken : undefined
  return cookieToken || bodyToken || ""
}
