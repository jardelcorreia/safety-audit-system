import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import backend from "~backend/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  User, 
  MapPin,
  AlertTriangle,
  Clock,
  CheckCircle,
  Camera,
  ExternalLink,
  FileText
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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

// Utility function to format date/time in Brasília timezone
const formatBrasiliaDateTime = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(dateObj);
};

export default function AuditDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: audit, isLoading } = useQuery({
    queryKey: ["audit", id],
    queryFn: async () => {
      if (!id) throw new Error("ID is required");
      try {
        return await backend.audit.get({ id: parseInt(id) });
      } catch (error) {
        console.error("Failed to fetch audit:", error);
        toast({
          title: "Erro",
          description: "Falha ao carregar auditoria",
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: Boolean(id),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("ID is required");
      return await backend.audit.deleteAudit({ id: parseInt(id) });
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Auditoria excluída com sucesso",
      });
      navigate("/audits");
    },
    onError: (error) => {
      console.error("Failed to delete audit:", error);
      toast({
        title: "Erro",
        description: "Falha ao excluir auditoria",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (window.confirm("Tem certeza que deseja excluir esta auditoria?")) {
      deleteMutation.mutate();
    }
  };

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

  const getStatusIcon = (status: string) => {
    return status === "Resolvido" ? CheckCircle : Clock;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Auditoria não encontrada</p>
        <Button asChild>
          <Link to="/audits">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para lista
          </Link>
        </Button>
      </div>
    );
  }

  const photos = audit.photos ? audit.photos.split(",").map(url => url.trim()).filter(Boolean) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/audits")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Auditoria #{audit.id}
          </h1>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to={`/audits/${audit.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="w-full sm:w-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>{audit.area}</span>
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={getPotentialColor(audit.potential)}>
                    {audit.potential}
                  </Badge>
                  <Badge variant={getStatusColor(audit.status)}>
                    {audit.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Tipo de Situação de Risco
                  </h3>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="text-gray-900">{audit.riskType}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Descrição da Situação Insegura
                  </h3>
                  <p className="text-gray-900 leading-relaxed">
                    {audit.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Ações Tomadas</span>
                  </h3>
                  <p className="text-gray-900 leading-relaxed bg-blue-50 p-3 rounded-lg">
                    {audit.actionDescription}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photos */}
          {photos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="h-5 w-5" />
                  <span>Fotos ({photos.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={photo}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                          onClick={() => window.open(photo, "_blank")}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="flex items-center justify-center h-full text-gray-500">
                                  <div class="text-center">
                                    <svg class="h-8 w-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                    <p class="text-sm">Erro ao carregar</p>
                                  </div>
                                </div>
                              `;
                            }
                          }}
                        />
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => window.open(photo, "_blank")}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-700">Auditor</p>
                  <p className="text-gray-900 truncate">{audit.auditor}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Data da Auditoria</p>
                  <p className="text-gray-900">
                    {formatBrasiliaDate(audit.auditDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Prazo</p>
                  <p className="text-gray-900">
                    {formatBrasiliaDate(audit.deadline)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-700">Responsável</p>
                  <p className="text-gray-900 truncate">{audit.responsible}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status da Ação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                {(() => {
                  const StatusIcon = getStatusIcon(audit.status);
                  return <StatusIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />;
                })()}
                <div>
                  <Badge variant={getStatusColor(audit.status)} className="mb-2">
                    {audit.status}
                  </Badge>
                  <p className="text-sm text-gray-600">
                    {audit.status === "Resolvido" 
                      ? "Esta auditoria foi concluída com sucesso."
                      : "Esta auditoria ainda está em andamento."
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metadados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <div>
                <span className="font-medium">Criado em:</span>{" "}
                <span className="block sm:inline">
                  {formatBrasiliaDateTime(audit.createdAt)}
                </span>
              </div>
              <div>
                <span className="font-medium">Registro:</span>{" "}
                <span className="block sm:inline">
                  {formatBrasiliaDateTime(audit.timestamp)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
