import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import backend from "~backend/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Download
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function ImportData() {
  const { toast } = useToast();
  const [csvData, setCsvData] = useState("");
  const [importResult, setImportResult] = useState<{
    imported: number;
    errors: string[];
  } | null>(null);

  const importMutation = useMutation({
    mutationFn: async (data: string) => {
      // Parse CSV data
      const lines = data.trim().split("\n");
      const headers = lines[0].split("\t");
      
      const audits = lines.slice(1).map(line => {
        const values = line.split("\t");
        return {
          timestamp: values[0] || "",
          area: values[1] || "",
          auditor: values[2] || "",
          date: values[3] || "",
          riskType: values[4] || "",
          potential: values[5] || "",
          description: values[6] || "",
          responsible: values[7] || "",
          deadline: values[8] || "",
          status: values[9] || "",
          actionDescription: values[10] || "",
          photos: values[11] || ""
        };
      });

      return await backend.audit.importAudits({ audits });
    },
    onSuccess: (result) => {
      setImportResult(result);
      toast({
        title: "Importação concluída",
        description: `${result.imported} auditorias importadas com sucesso`,
      });
    },
    onError: (error) => {
      console.error("Failed to import data:", error);
      toast({
        title: "Erro na importação",
        description: "Falha ao importar dados",
        variant: "destructive",
      });
    },
  });

  const handleImport = () => {
    if (!csvData.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, cole os dados para importar",
        variant: "destructive",
      });
      return;
    }

    importMutation.mutate(csvData);
  };

  const sampleData = `Carimbo de data/hora	Área	Auditor:	Data:	Tipo de Situação de Risco:	Pontencial:	Descrição da Situação Insegura:	Responsável pela Ação:	Prazo:	Status da Ação:	Ações Tomadas:	Foto:
5/27/2025 14:21:50	Lingotamento	Anderson José Silva	27/05/2025	Isolamento Deficiente	Baixo	Isolamento inadequado próximo ao prédio novo do lingotamento.	O mesmo foi corrigido de forma q evite a entrada de pessoas não autorizadas.	27/05/2025	Resolvido	Foi instalada nova cerca de proteção e sinalização adequada para restringir o acesso.	https://drive.google.com/open?id=1qVYQeVumMS9hX97QD6zTZjuGccrglFUz`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Importar Dados</h1>
        <Button
          variant="outline"
          onClick={() => setCsvData(sampleData)}
        >
          <Download className="h-4 w-4 mr-2" />
          Carregar Exemplo
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Import Form */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Importar Auditorias</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Cole os dados da planilha no formato TSV (separado por tabs) no campo abaixo. 
                  A primeira linha deve conter os cabeçalhos das colunas.
                </AlertDescription>
              </Alert>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Dados da Planilha (TSV)
                </label>
                <Textarea
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  placeholder="Cole aqui os dados copiados da planilha..."
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setCsvData("")}
                  disabled={!csvData || importMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  Limpar
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={!csvData || importMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {importMutation.isPending ? "Importando..." : "Importar Dados"}
                </Button>
              </div>

              {importMutation.isPending && (
                <div className="space-y-2">
                  <Progress value={50} className="w-full" />
                  <p className="text-sm text-gray-600 text-center">
                    Processando dados...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions and Results */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Como Importar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0">1</span>
                <p>Abra sua planilha no Excel ou Google Sheets</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0">2</span>
                <p>Selecione todos os dados incluindo cabeçalhos</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0">3</span>
                <p>Copie os dados (Ctrl+C)</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0">4</span>
                <p>Cole no campo de texto ao lado</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0">5</span>
                <p>Clique em "Importar Dados"</p>
              </div>
            </CardContent>
          </Card>

          {/* Import Results */}
          {importResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {importResult.errors.length === 0 ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  )}
                  <span>Resultado da Importação</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-green-800">
                    Importadas com sucesso
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {importResult.imported}
                  </span>
                </div>

                {importResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <span className="text-sm font-medium text-yellow-800">
                        Erros encontrados
                      </span>
                      <span className="text-lg font-bold text-yellow-600">
                        {importResult.errors.length}
                      </span>
                    </div>
                    
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {importResult.errors.map((error, index) => (
                        <p key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                          {error}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Formato Esperado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Colunas obrigatórias:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Carimbo de data/hora</li>
                  <li>Área</li>
                  <li>Auditor</li>
                  <li>Data</li>
                  <li>Tipo de Situação de Risco</li>
                  <li>Potencial</li>
                  <li>Descrição da Situação Insegura</li>
                  <li>Responsável pela Ação</li>
                  <li>Prazo</li>
                  <li>Status da Ação</li>
                  <li>Ações Tomadas</li>
                  <li>Foto (opcional)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
