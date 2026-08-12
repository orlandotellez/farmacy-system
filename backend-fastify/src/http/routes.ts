import { authRoutes } from "@/modules/auth/presentation/auth.routes"
import { usersRoutes } from "@/modules/users/presentation/users.routes"
import { categoriesRoutes } from "@/modules/categories/presentation/categories.routes"
import { suppliersRoutes } from "@/modules/suppliers/presentation/suppliers.routes"
import { medicinesRoutes } from "@/modules/medicines/presentation/medicines.routes"
import { clientsRoutes } from "@/modules/clients/presentation/clients.routes"
import { prescriptionsRoutes } from "@/modules/prescriptions/presentation/prescriptions.routes"
import { purchasesRoutes } from "@/modules/purchases/presentation/purchases.routes"
import { batchInventoryRoutes } from "@/modules/batch-inventory/presentation/batch-inventory.routes"
import { inventoryRoutes } from "@/modules/inventory/presentation/inventory.routes"
import { salesRoutes } from "@/modules/sales/presentation/sales.routes"
import { FastifyInstance, FastifyPluginOptions } from "fastify"

export const routes = async (fastify: FastifyInstance, _opts: FastifyPluginOptions) => {
  fastify.register(authRoutes, { prefix: "/auth" })
  fastify.register(usersRoutes, { prefix: "/users" })
  fastify.register(categoriesRoutes, { prefix: "/categories" })
  fastify.register(suppliersRoutes, { prefix: "/suppliers" })
  fastify.register(medicinesRoutes, { prefix: "/medicines" })
  fastify.register(clientsRoutes, { prefix: "/clients" })
  fastify.register(prescriptionsRoutes, { prefix: "/prescriptions" })
  fastify.register(purchasesRoutes, { prefix: "/purchases" })
  fastify.register(batchInventoryRoutes, { prefix: "/inventory/batches" })
  fastify.register(inventoryRoutes, { prefix: "/inventory" })
  fastify.register(salesRoutes, { prefix: "/sales" })
}

