export interface Auditor {
  id: number;
  name: string;
  createdAt: Date;
}

export interface CreateAuditorRequest {
  name: string;
}

export interface UpdateAuditorRequest {
  id: number;
  name: string;
}

export interface ListAuditorsResponse {
  auditors: Auditor[];
}
