import type { FastifyReply, FastifyRequest } from "fastify"
import { createUserService } from "../application/users.service"
import { UserRepository } from "../infrastructure/users.drizzle.repository"
import { CreateUserDtoSchema, UpdateUserDtoSchema, UserQuerySchema } from "./users.dto"

const userService = createUserService(UserRepository)

export const usersController = {
  list: async (request: FastifyRequest, reply: FastifyReply) =>
    reply.send(await userService.list({ ...UserQuerySchema.parse(request.query), storeId: request.storeId })),

  getById: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    return reply.send(await userService.getById(id, request.storeId!))
  },

  create: async (request: FastifyRequest, reply: FastifyReply) => {
    const data = CreateUserDtoSchema.parse(request.body)
    const user = await userService.create(data, request.storeId!)
    return reply.status(201).send(user)
  },

  update: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const data = UpdateUserDtoSchema.parse(request.body)
    const user = await userService.update(id, data, request.storeId!)
    return reply.send(user)
  },

  delete: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    if (id === request.userId) return reply.status(400).send({ message: "You cannot delete your own account" })
    const user = await userService.getById(id, request.storeId!)
    await userService.delete(id, request.storeId!)
    return reply.send({ message: "User deleted successfully" })
  },
}
