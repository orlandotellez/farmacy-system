import { IClientEntity } from "../../domain/clients.entities";
import { IClientResponse } from "../../domain/clients.types";

export function mapClient(client: IClientEntity): IClientResponse {
  return {
    id: client.id,
    full_name: client.full_name,
    document_type: client.document_type,
    document_number: client.document_number ?? null,
    phone: client.phone ?? null,
    email: client.email ?? null,
    address: client.address ?? null,
    birth_date: client.birth_date instanceof Date ? client.birth_date.toISOString() : client.birth_date ?? null,
    sex: client.sex ?? null,
    allergies: client.allergies ?? null,
    chronic_diseases: client.chronic_diseases ?? null,
    observations: client.observations ?? null,
    is_frequent: client.is_frequent,
    created_at: client.created_at.toISOString(),
    updated_at: client.updated_at.toISOString(),
  }
}

