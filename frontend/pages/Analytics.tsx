import { useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Target,
  Award,
  AlertTriangle,
  Users
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Analytics() {
  const { toast } = useToast();

  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ["audit-trends"],
    queryFn: async () => {
      try {
        return await backend.audit.getTrends();
      } catch (error) {
        console.error("Failed to fetch trends:", error);
        toast({
          title: "Erro",
          description: "Falha ao carregar tendências",
          variant: "destructive",
        });
        throw error;
      }
    },
  });

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

  if (trendsLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Análises</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-64 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalResolutionRate = stats?.totalAudits 
    ? Math.round((stats.resolvedAudits / stats.totalAudits) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Análises</h1>
        <Badge variant="outline" className="text-sm w-fit">
          Dados atualizados em tempo real
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Resolução</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">{totalResolutionRate}%</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Melhor Área</p>
                <p className="text-lg font-bold text-blue-600 truncate">
                  {trends?.areaPerformance[0]?.area || "N/A"}
                </p>
                <p className="text-sm text-gray-500">
                  {trends?.areaPerformance[0]?.resolutionRate.toFixed(1)}% resolvidas
                </p>
              </div>
              <Award className="h-8 w-8 text-blue-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Risco Mais Comum</p>
                <p className="text-lg font-bold text-orange-600 truncate">
                  {trends?.riskDistribution[0]?.riskType || "N/A"}
                </p>
                <p className="text-sm text-gray-500">
                  {trends?.riskDistribution[0]?.percentage.toFixed(1)}% dos casos
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Auditores Ativos</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-600">
                  {Object.keys(stats?.byArea || {}).length}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Tendências Mensais</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trends?.monthlyTrends.slice(-6).map((month) => {
                const resolutionRate = month.total > 0 ? (month.resolved / month.total) * 100 : 0;
                return (
                  <div key={month.month} className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{month.month}</p>
                      <p className="text-sm text-gray-600">
                        {month.total} auditorias
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-medium">{resolutionRate.toFixed(1)}%</p>
                      <p className="text-sm text-gray-600">
                        {month.resolved}/{month.total} resolvidas
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Area Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Performance por Área</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trends?.areaPerformance.slice(0, 6).map((area) => (
                <div key={area.area} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate flex-1 mr-2">{area.area}</span>
                    <span className="text-sm text-gray-600 flex-shrink-0">
                      {area.resolutionRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${area.resolutionRate}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{area.total} auditorias</span>
                    <span>~{area.avgResolutionDays} dias para resolver</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Distribuição de Riscos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trends?.riskDistribution.slice(0, 8).map((risk) => (
                <div key={risk.riskType} className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate flex-1 mr-2">
                    {risk.riskType}
                  </span>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="text-sm text-gray-600">{risk.count}</span>
                    <span className="text-xs text-gray-400">
                      ({risk.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Potential Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Potencial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats?.byPotential || {})
                .sort(([,a], [,b]) => b - a)
                .map(([potential, count]) => {
                  const percentage = stats?.totalAudits 
                    ? (count / stats.totalAudits) * 100
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
                    <div key={potential} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getColor(potential)}`} />
                          <span className="font-medium">{potential}</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${getColor(potential)}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
