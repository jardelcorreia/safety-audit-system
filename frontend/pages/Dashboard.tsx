import { useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Users,
  MapPin
} from "lucide-react";
import StatsCard from "../components/StatsCard";
import RecentAudits from "../components/RecentAudits";
import { useToast } from "@/components/ui/use-toast";

// Utility function to format date/time in Brasília timezone
const formatBrasiliaTime = (date: Date) => {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
};

export default function Dashboard() {
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["audit-stats"],
    queryFn: async () => {
      try {
        return await backend.audit.getStats();
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        toast({
          title: "Erro",
          description: "Falha ao carregar estatísticas",
          variant: "destructive",
        });
        throw error;
      }
    },
  });

  const { data: audits, isLoading: auditsLoading } = useQuery({
    queryKey: ["recent-audits"],
    queryFn: async () => {
      try {
        const response = await backend.audit.list({ limit: 10 });
        return response.audits;
      } catch (error) {
        console.error("Failed to fetch recent audits:", error);
        toast({
          title: "Erro",
          description: "Falha ao carregar auditorias recentes",
          variant: "destructive",
        });
        throw error;
      }
    },
  });

  if (statsLoading || auditsLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const resolutionRate = stats?.totalAudits 
    ? Math.round((stats.resolvedAudits / stats.totalAudits) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <Badge variant="outline" className="text-sm w-fit">
          Última atualização: {formatBrasiliaTime(new Date())}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Total de Auditorias"
          value={stats?.totalAudits || 0}
          icon={TrendingUp}
          trend={`${resolutionRate}% resolvidas`}
          trendUp={resolutionRate >= 80}
        />
        
        <StatsCard
          title="Resolvidas"
          value={stats?.resolvedAudits || 0}
          icon={CheckCircle}
          trend="Concluídas"
          trendUp={true}
          className="text-green-600"
        />
        
        <StatsCard
          title="Em Andamento"
          value={stats?.pendingAudits || 0}
          icon={Clock}
          trend="Pendentes"
          trendUp={false}
          className="text-yellow-600"
        />
        
        <StatsCard
          title="Áreas Auditadas"
          value={Object.keys(stats?.byArea || {}).length}
          icon={MapPin}
          trend="Diferentes áreas"
          trendUp={true}
          className="text-blue-600"
        />
      </div>

      {/* Risk Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Distribuição por Potencial</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats?.byPotential || {}).map(([potential, count]) => {
                const percentage = stats?.totalAudits 
                  ? Math.round((count / stats.totalAudits) * 100)
                  : 0;
                
                const getColor = (potential: string) => {
                  switch (potential) {
                    case "Alto": return "bg-red-500";
                    case "Médio": return "bg-yellow-500";
                    case "Baixo": return "bg-green-500";
                    default: return "bg-gray-500";
                  }
                };

                return (
                  <div key={potential} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getColor(potential)}`} />
                      <span className="text-sm font-medium">{potential}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{count}</span>
                      <span className="text-xs text-gray-400">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Top Áreas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats?.byArea || {})
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([area, count]) => {
                  const percentage = stats?.totalAudits 
                    ? Math.round((count / stats.totalAudits) * 100)
                    : 0;

                  return (
                    <div key={area} className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate flex-1 mr-2">{area}</span>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className="text-sm text-gray-600">{count}</span>
                        <span className="text-xs text-gray-400">({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Audits */}
      <RecentAudits audits={audits || []} />
    </div>
  );
}
