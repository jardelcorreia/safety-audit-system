export type RiskPotential = "Sem Desvio" | "Baixo" | "Médio" | "Alto";
export type AuditStatus = "Resolvido" | "Em Andamento";

export const RISK_TYPES = [
  "Isolamento Deficiente",
  "Piso Irregular",
  "Equipamento sem Proteção",
  "Falta de EPI",
  "Área sem Sinalização",
  "Vazamento de Fluidos",
  "Fiação Exposta",
  "Estrutura Danificada",
  "Acesso Inadequado",
  "Iluminação Deficiente",
  "Ventilação Inadequada",
  "Material Mal Armazenado",
  "Ferramenta Defeituosa",
  "Procedimento Inadequado",
  "Falta de Treinamento",
  "Sobrecarga de Trabalho",
  "Ergonomia Inadequada",
  "Ruído Excessivo",
  "Temperatura Inadequada",
  "Contaminação Química",
  "Risco de Queda",
  "Risco de Corte",
  "Risco de Queimadura",
  "Risco Elétrico",
  "Risco de Explosão",
  "Documentação",
  "Outro"
] as const;

export type RiskType = typeof RISK_TYPES[number];

export interface Audit {
  id: number;
  timestamp: Date;
  area: string;
  auditor: string;
  auditDate: Date;
  riskType: string;
  potential: RiskPotential;
  description: string;
  responsible: string;
  deadline: Date;
  status: AuditStatus;
  actionDescription: string;
  photos?: string;
  createdAt: Date;
}

export interface CreateAuditRequest {
  timestamp: Date;
  area: string;
  auditor: string;
  auditDate: Date;
  riskType: string;
  potential: RiskPotential;
  description: string;
  responsible: string;
  deadline: Date;
  status: AuditStatus;
  actionDescription: string;
  photos?: string;
}

export interface UpdateAuditRequest {
  id: number;
  area?: string;
  auditor?: string;
  auditDate?: Date;
  riskType?: string;
  potential?: RiskPotential;
  description?: string;
  responsible?: string;
  deadline?: Date;
  status?: AuditStatus;
  actionDescription?: string;
  photos?: string;
}

export interface ListAuditsParams {
  area?: string;
  auditor?: string;
  status?: AuditStatus;
  potential?: RiskPotential;
  riskType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface ListAuditsResponse {
  audits: Audit[];
  total: number;
}

export interface AuditStats {
  totalAudits: number;
  resolvedAudits: number;
  pendingAudits: number;
  byPotential: Record<RiskPotential, number>;
  byArea: Record<string, number>;
  byRiskType: Record<string, number>;
  byStatus: Record<AuditStatus, number>;
}

export interface AuditTrends {
  monthlyTrends: Array<{
    month: string;
    total: number;
    resolved: number;
    pending: number;
  }>;
  areaPerformance: Array<{
    area: string;
    total: number;
    resolutionRate: number;
    avgResolutionDays: number;
  }>;
  riskDistribution: Array<{
    riskType: string;
    count: number;
    percentage: number;
  }>;
}
