import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Clock } from "lucide-react";
import type { Audit } from "~backend/audit/types";

interface RecentAuditsProps {
  audits: Audit[];
}

// Utility function to format date in Brasília timezone
const formatBrasiliaDate = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(dateObj);
};

export default function RecentAudits({ audits }: RecentAuditsProps) {
  const getPotentialColor = (potential: string) => {
    switch (potential) {
      case "Alto": return "destructive";
      case "Médio": return "default";
      case "Baixo": return "secondary";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "Resolvido" ? "secondary" : "default";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Auditorias Recentes</span>
        </CardTitle>
        <Button asChild variant="outline" size="sm">
          <Link to="/audits">Ver todas</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {audits.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhuma auditoria encontrada
            </p>
          ) : (
            audits.map((audit) => (
              <div
                key={audit.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors space-y-3 sm:space-y-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {audit.area}
                    </h3>
                    <Badge variant={getPotentialColor(audit.potential)} size="sm">
                      {audit.potential}
                    </Badge>
                    <Badge variant={getStatusColor(audit.status)} size="sm">
                      {audit.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {audit.description}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs text-gray-500">
                    <div>
                      <span className="font-medium">Auditor:</span> {audit.auditor}
                    </div>
                    <div>
                      <span className="font-medium">Data:</span> {formatBrasiliaDate(audit.auditDate)}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end sm:ml-4">
                  <Button asChild variant="ghost" size="sm">
                    <Link to={`/audits/${audit.id}`}>
                      <Eye className="h-4 w-4" />
                      <span className="ml-1 sm:hidden">Ver</span>
                    </Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
