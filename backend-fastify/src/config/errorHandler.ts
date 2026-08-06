import { AppError } from "@/core/errors/AppError";
import { FastifyError, FastifyReply, FastifyRequest } from "fastify"
import { ZodError } from "zod"

const CLIENT_ERROR_MESSAGES: Record<number, string> = {
  400: "Solicitud inválida",
  401: "No autorizado",
  403: "Acceso denegado",
  404: "No encontrado",
  405: "Método no permitido",
  408: "Tiempo de espera agotado",
  409: "Conflicto",
  413: "Solicitud demasiado grande",
  415: "Tipo de contenido no soportado",
  422: "Entidad no procesable",
  429: "Demasiadas solicitudes",
}

export const errorHandler = (
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  if (error instanceof ZodError || ("code" in error && error.code === "FST_ERR_VALIDATION")) {
    const validation = "validation" in error && Array.isArray(error.validation) ? error.validation : [];
    const first = error instanceof ZodError ? error.errors[0] : validation[0];
    return reply.status(400).send({
      message: first?.message ?? "Datos inválidos",
    });
  }

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      message: error.message
    })
  }

  // Errores de Fastify con status code de cliente (body inválido, rate limit, etc.)
  // Se respeta el código pero se oculta el mensaje original (puede revelar detalles).
  if ("statusCode" in error && typeof error.statusCode === "number" && error.statusCode >= 400 && error.statusCode < 500) {
    request.log.warn(error);
    return reply.status(error.statusCode).send({
      message: CLIENT_ERROR_MESSAGES[error.statusCode] ?? "Solicitud inválida",
    })
  }

  request.log.error(error);
  return reply.status(500).send({
    message: "Error interno del servidor",
  });
}

export const notFoundHandler = (
  _request: FastifyRequest,
  reply: FastifyReply,
) => {
  reply.status(404).send({
    message: "Recurso no encontrado",
    statusCode: 404
  })
}
