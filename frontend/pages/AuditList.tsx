import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import backend from "~backend/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  Eye, 
  Edit,
  Filter,
  X
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Predefined risk types for filtering
const riskTypes = [
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
];

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

export default function AuditList() {
  const { toast } = useToast();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    area: "",
    status: "",
    potential: "",
    auditor: "",
    riskType: "",
    limit: 20,
    offset: 0
  });

  const { data, isLoading } = useQuery({
    queryKey: ["audits", filters],
    queryFn: async () => {
      try {
        const params: any = {};
        if (filters.area) params.area = filters.area;
        if (filters.status && filters.status !== "all") params.status = filters.status;
        if (filters.potential && filters.potential !== "all") params.potential = filters.potential;
        if (filters.auditor) params.auditor = filters.auditor;
        if (filters.riskType && filters.riskType !== "all") params.riskType = filters.riskType;
        params.limit = filters.limit;
        params.offset = filters.offset;

        return await backend.audit.list(params);
      } catch (error) {
        console.error("Failed to fetch audits:", error);
        toast({
          title: "Erro",
          description: "Falha ao carregar auditorias",
          variant: "destructive",
        });
        throw error;
      }
    },
  });

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

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      offset: 0 // Reset pagination when filtering
    }));
  };

  const clearFilters = () => {
    setFilters({
      area: "",
      status: "",
      potential: "",
      auditor: "",
      riskType: "",
      limit: 20,
      offset: 0
    });
  };

  const handlePageChange = (newOffset: number) => {
    setFilters(prev => ({ ...prev, offset: newOffset }));
  };

  const totalPages = data ? Math.ceil(data.total / filters.limit) : 0;
  const currentPage = Math.floor(filters.offset / filters.limit) + 1;

  const hasActiveFilters = filters.area || filters.status || filters.potential || filters.auditor || filters.riskType;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Auditorias</h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                !
              </Badge>
            )}
          </Button>
          <Button asChild>
            <Link to="/audits/new">
              <Plus className="h-4 w-4 mr-2" />
              Nova Auditoria
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className={`${showFilters ? 'block' : 'hidden'} sm:block`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(false)}
            className="sm:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Área
              </label>
              <Input
                placeholder="Filtrar por área..."
                value={filters.area}
                onChange={(e) => handleFilterChange("area", e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Status
              </label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="Resolvido">Resolvido</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Potencial
              </label>
              <Select value={filters.potential} onValueChange={(value) => handleFilterChange("potential", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os potenciais" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os potenciais</SelectItem>
                  <SelectItem value="Alto">Alto</SelectItem>
                  <SelectItem value="Médio">Médio</SelectItem>
                  <SelectItem value="Baixo">Baixo</SelectItem>
                  <SelectItem value="Sem Desvio">Sem Desvio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Tipo de Risco
              </label>
              <Select value={filters.riskType} onValueChange={(value) => handleFilterChange("riskType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {riskTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Auditor
              </label>
              <Input
                placeholder="Filtrar por auditor..."
                value={filters.auditor}
                onChange={(e) => handleFilterChange("auditor", e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 space-y-2 sm:space-y-0">
            {hasActiveFilters && (
              <div className="text-sm text-gray-600">
                Filtros ativos aplicados
              </div>
            )}
            <Button variant="outline" onClick={clearFilters} className="ml-auto">
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
            <CardTitle>
              Resultados ({data?.total || 0} auditorias)
            </CardTitle>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Search className="h-4 w-4" />
              <span>
                Página {currentPage} de {totalPages}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : data?.audits.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Nenhuma auditoria encontrada</p>
              <Button asChild>
                <Link to="/audits/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar primeira auditoria
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {data?.audits.map((audit) => (
                <div
                  key={audit.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {audit.area}
                        </h3>
                        <Badge variant={getPotentialColor(audit.potential)}>
                          {audit.potential}
                        </Badge>
                        <Badge variant={getStatusColor(audit.status)}>
                          {audit.status}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {audit.description}
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 text-sm text-gray-500">
                        <div>
                          <span className="font-medium">Tipo:</span> {audit.riskType}
                        </div>
                        <div>
                          <span className="font-medium">Auditor:</span> {audit.auditor}
                        </div>
                        <div>
                          <span className="font-medium">Data:</span> {formatBrasiliaDate(audit.auditDate)}
                        </div>
                        <div>
                          <span className="font-medium">Prazo:</span> {formatBrasiliaDate(audit.deadline)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 lg:ml-4">
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/audits/${audit.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="ml-1 sm:hidden">Ver</span>
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/audits/${audit.id}/edit`}>
                          <Edit className="h-4 w-4" />
                          <span className="ml-1 sm:hidden">Editar</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {data && data.total > filters.limit && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 space-y-4 sm:space-y-0">
              <Button
                variant="outline"
                disabled={filters.offset === 0}
                onClick={() => handlePageChange(Math.max(0, filters.offset - filters.limit))}
              >
                Anterior
              </Button>
              
              <span className="text-sm text-gray-600">
                Mostrando {filters.offset + 1} a {Math.min(filters.offset + filters.limit, data.total)} de {data.total}
              </span>
              
              <Button
                variant="outline"
                disabled={filters.offset + filters.limit >= data.total}
                onClick={() => handlePageChange(filters.offset + filters.limit)}
              >
                Próxima
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
