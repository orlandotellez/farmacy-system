import { and, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { batch, client, medicine, purchase, sale, saleItem, users } from "@/db/schema";
import { db } from "@/index";
import type { IReportRepository } from "../domain/reports.interface";
import type { IDashboardReport, IFinancialReport } from "../domain/reports.types";

const EXPIRATION_ALERT_DAYS = 60; // settings table not available yet (Feature 11)

const dateKey = (date: Date) => date.toISOString().slice(0, 10);

export const ReportRepository: IReportRepository = {
  async getDashboard(storeId: string): Promise<IDashboardReport> {
    const now = new Date();
    const startToday = new Date(now); startToday.setHours(0, 0, 0, 0);
    const start30 = new Date(now); start30.setDate(start30.getDate() - 29); start30.setHours(0, 0, 0, 0);
    const startWeek = new Date(now); startWeek.setDate(startWeek.getDate() - 6); startWeek.setHours(0, 0, 0, 0);
    const expirationLimit = new Date(now); expirationLimit.setDate(expirationLimit.getDate() + EXPIRATION_ALERT_DAYS);

    const saleConditions = (from?: Date, to?: Date) =>
      and(eq(sale.storeId, storeId), eq(sale.status, "completada"), from ? gte(sale.createdAt, from) : undefined, to ? lte(sale.createdAt, to) : undefined);

    const [todayRows, recentRows, last30Rows, weekRows, medicineRows, batchRows] = await Promise.all([
      db.select().from(sale).where(saleConditions(startToday)),
      db
        .select({ sale, user: users, client })
        .from(sale)
        .leftJoin(users, eq(sale.userId, users.id))
        .leftJoin(client, eq(sale.clientId, client.id))
        .where(eq(sale.storeId, storeId))
        .orderBy(sql`${sale.createdAt} desc`)
        .limit(8),
      db.select({ createdAt: sale.createdAt, total: sale.total }).from(sale).where(saleConditions(start30)),
      db.select().from(sale).where(saleConditions(startWeek)),
      db
        .select({ stock: medicine.stock, lowStockThreshold: medicine.lowStockThreshold })
        .from(medicine)
        .where(and(eq(medicine.storeId, storeId), eq(medicine.active, true), sql`${medicine.deletedAt} is null`)),
      db.select({ expiryDate: batch.expiryDate }).from(batch).where(eq(batch.storeId, storeId)),
    ]);

    const revenue = todayRows.reduce((sum, sale) => sum + Number(sale.total), 0);

    const [todayItemCounts] = await db
      .select({ total: sql<number>`COALESCE(SUM(${saleItem.quantity}), 0)::int` })
      .from(saleItem)
      .where(todayRows.length ? inArray(saleItem.saleId, todayRows.map((sale) => sale.id)) : sql`false`);
    const totalItemsSold = todayItemCounts?.total ?? 0;

    const paymentMap = new Map<string, { count: number; total: number }>();
    for (const sale of todayRows) {
      const current = paymentMap.get(sale.paymentMethod) ?? { count: 0, total: 0 };
      current.count++;
      current.total += Number(sale.total);
      paymentMap.set(sale.paymentMethod, current);
    }

    const topMap = new Map<string, { medicine_name: string; quantity: number; revenue: number }>();
    const weekItems = weekRows.length
      ? await db.select().from(saleItem).where(inArray(saleItem.saleId, weekRows.map((sale) => sale.id)))
      : [];
    for (const item of weekItems) {
      const current = topMap.get(item.medicineId) ?? { medicine_name: item.medicineName, quantity: 0, revenue: 0 };
      current.quantity += item.quantity;
      current.revenue += Number(item.lineTotal);
      topMap.set(item.medicineId, current);
    }

    const revenueMap = new Map<string, number>();
    for (const sale of last30Rows) revenueMap.set(dateKey(sale.createdAt), (revenueMap.get(dateKey(sale.createdAt)) ?? 0) + Number(sale.total));

    return {
      today: {
        revenue,
        sales_count: todayRows.length,
        average_ticket: todayRows.length ? revenue / todayRows.length : 0,
        items_sold: totalItemsSold,
      },
      low_stock_count: medicineRows.filter((medicine) => medicine.stock > 0 && medicine.stock <= medicine.lowStockThreshold).length,
      out_of_stock_count: medicineRows.filter((medicine) => medicine.stock === 0).length,
      expiring_soon_count: batchRows.filter((batch) => batch.expiryDate > now && batch.expiryDate <= expirationLimit).length,
      expired_count: batchRows.filter((batch) => batch.expiryDate <= now).length,
      revenue_30d: Array.from({ length: 30 }, (_, index) => {
        const date = new Date(start30);
        date.setDate(start30.getDate() + index);
        const period = dateKey(date);
        return { period, revenue: revenueMap.get(period) ?? 0 };
      }),
      sales_by_payment: [...paymentMap.entries()].map(([method, value]) => ({ method, ...value })),
      top_products_week: [...topMap.entries()]
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 10)
        .map(([medicine_id, value]) => ({ medicine_id, ...value })),
      recent_sales: recentRows.map((row) => ({
        id: row.sale.id,
        subtotal: Number(row.sale.subtotal),
        total: Number(row.sale.total),
        payment_method: row.sale.paymentMethod,
        status: row.sale.status,
        user_id: row.sale.userId,
        user_name: row.sale.userName ?? row.user?.name ?? null,
        client_id: row.sale.clientId ?? null,
        client_name: row.client?.fullName ?? null,
        prescription_id: row.sale.prescriptionId ?? null,
        created_at: row.sale.createdAt.toISOString(),
        updated_at: row.sale.updatedAt.toISOString(),
      })),
    };
  },

  async getFinancial(params): Promise<IFinancialReport> {
    const saleConditions = and(
      eq(sale.storeId, params.storeId),
      eq(sale.status, "completada"),
      params.from ? gte(sale.createdAt, params.from) : undefined,
      params.to ? lte(sale.createdAt, params.to) : undefined,
    );

    const [sales, purchases] = await Promise.all([
      db
        .select({ sale, item: saleItem, medicine })
        .from(sale)
        .innerJoin(saleItem, eq(saleItem.saleId, sale.id))
        .innerJoin(medicine, eq(saleItem.medicineId, medicine.id))
        .where(saleConditions),
      db
        .select({ createdAt: purchase.createdAt, total: purchase.total })
        .from(purchase)
        .where(and(
          eq(purchase.storeId, params.storeId),
          eq(purchase.status, "recibida"),
          params.from ? gte(purchase.createdAt, params.from) : undefined,
          params.to ? lte(purchase.createdAt, params.to) : undefined,
        )),
    ]);

    const products = new Map<string, { medicine_name: string; quantity: number; revenue: number; profit: number }>();
    const labs = new Map<string, { revenue: number; profit: number }>();
    let revenue = 0;
    let cost = 0;

    for (const row of sales) {
      const lineRevenue = Number(row.item.lineTotal);
      const lineCost = Number(row.medicine.purchasePrice) * row.item.quantity;
      revenue += lineRevenue;
      cost += lineCost;
      const product = products.get(row.item.medicineId) ?? { medicine_name: row.item.medicineName, quantity: 0, revenue: 0, profit: 0 };
      product.quantity += row.item.quantity;
      product.revenue += lineRevenue;
      product.profit += lineRevenue - lineCost;
      products.set(row.item.medicineId, product);
      const laboratory = row.medicine.laboratory || "Sin laboratorio";
      const lab = labs.get(laboratory) ?? { revenue: 0, profit: 0 };
      lab.revenue += lineRevenue;
      lab.profit += lineRevenue - lineCost;
      labs.set(laboratory, lab);
    }

    const flow = new Map<string, { revenue: number; purchases: number }>();
    for (const row of sales) {
      const key = dateKey(row.sale.createdAt);
      const current = flow.get(key) ?? { revenue: 0, purchases: 0 };
      current.revenue += Number(row.item.lineTotal);
      flow.set(key, current);
    }
    for (const purchase of purchases) {
      const key = dateKey(purchase.createdAt);
      const current = flow.get(key) ?? { revenue: 0, purchases: 0 };
      current.purchases += Number(purchase.total);
      flow.set(key, current);
    }

    return {
      total_revenue: revenue,
      total_cost: cost,
      total_profit: revenue - cost,
      profit_margin: revenue ? ((revenue - cost) / revenue) * 100 : 0,
      by_product: [...products.entries()]
        .sort((a, b) => b[1].profit - a[1].profit)
        .map(([medicine_id, value]) => ({ medicine_id, ...value })),
      by_laboratory: [...labs.entries()]
        .sort((a, b) => b[1].profit - a[1].profit)
        .map(([laboratory, value]) => ({ laboratory, ...value })),
      cash_flow: [...flow.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([period, value]) => ({ period, ...value })),
    };
  },
};
