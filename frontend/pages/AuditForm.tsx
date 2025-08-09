import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import PhotoUpload from "../components/PhotoUpload";
import type { CreateAuditRequest, UpdateAuditRequest, RiskPotential, AuditStatus, RISK_TYPES } from "~backend/audit/types";

// Predefined risk types
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

// Utility function to convert date to local datetime-local format
const toLocalDateTimeLocal = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  // Get the local time offset and adjust
  const offset = dateObj.getTimezoneOffset() * 60000;
  const localDate = new Date(dateObj.getTime() - offset);
  return localDate.toISOString().slice(0, 16);
};

const toLocalDate = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  // Get the local time offset and adjust
  const offset = dateObj.getTimezoneOffset() * 60000;
  const localDate = new Date(dateObj.getTime() - offset);
  return localDate.toISOString().slice(0, 10);
};

export default function AuditForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    timestamp: toLocalDateTimeLocal(new Date()),
    area: "",
    auditor: "",
    auditDate: toLocalDate(new Date()),
    riskType: "",
    customRiskType: "",
    potential: "Baixo" as RiskPotential,
    description: "",
    responsible: "",
    deadline: toLocalDate(new Date()),
    status: "Em Andamento" as AuditStatus,
    actionDescription: "",
    photos: [] as string[]
  });

  // Load auditors list
  const { data: auditorsData } = useQuery({
    queryKey: ["auditors"],
    queryFn: async () => {
      try {
        return await backend.auditor.list();
      } catch (error) {
        console.error("Failed to fetch auditors:", error);
        return { auditors: [] };
      }
    },
  });

  // Load predefined areas list
  const { data: areasData } = useQuery({
    queryKey: ["areas"],
    queryFn: async () => {
      try {
        return await backend.area.list();
      } catch (error) {
        console.error("Failed to fetch areas:", error);
        return { areas: [] };
      }
    },
  });

  // Load existing audit for editing
  const { data: existingAudit, isLoading } = useQuery({
    queryKey: ["audit", id],
    queryFn: async () => {
      if (!id) return null;
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
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingAudit) {
      const photos = existingAudit.photos 
        ? existingAudit.photos.split(",").map(url => url.trim()).filter(Boolean)
        : [];

      const isCustomRiskType = !riskTypes.includes(existingAudit.riskType);

      setFormData({
        timestamp: toLocalDateTimeLocal(existingAudit.timestamp),
        area: existingAudit.area,
        auditor: existingAudit.auditor,
        auditDate: toLocalDate(existingAudit.auditDate),
        riskType: isCustomRiskType ? "Outro" : existingAudit.riskType,
        customRiskType: isCustomRiskType ? existingAudit.riskType : "",
        potential: existingAudit.potential,
        description: existingAudit.description,
        responsible: existingAudit.responsible,
        deadline: toLocalDate(existingAudit.deadline),
        status: existingAudit.status,
        actionDescription: existingAudit.actionDescription,
        photos
      });
    }
  }, [existingAudit]);

  const createMutation = useMutation({
    mutationFn: async (data: CreateAuditRequest) => {
      return await backend.audit.create(data);
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Auditoria criada com sucesso",
      });
      navigate("/audits");
    },
    onError: (error) => {
      console.error("Failed to create audit:", error);
      toast({
        title: "Erro",
        description: "Falha ao criar auditoria",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateAuditRequest) => {
      return await backend.audit.update(data);
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Auditoria atualizada com sucesso",
      });
      navigate("/audits");
    },
    onError: (error) => {
      console.error("Failed to update audit:", error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar auditoria",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Determine the final risk type
    const finalRiskType = formData.riskType === "Outro" ? formData.customRiskType : formData.riskType;

    if (!finalRiskType.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, especifique o tipo de situação de risco",
        variant: "destructive",
      });
      return;
    }

    if (!formData.actionDescription.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, descreva as ações tomadas",
        variant: "destructive",
      });
      return;
    }

    const data = {
      timestamp: new Date(formData.timestamp),
      area: formData.area,
      auditor: formData.auditor,
      auditDate: new Date(formData.auditDate),
      riskType: finalRiskType,
      potential: formData.potential,
      description: formData.description,
      responsible: formData.responsible,
      deadline: new Date(formData.deadline),
      status: formData.status,
      actionDescription: formData.actionDescription,
      photos: formData.photos.length > 0 ? formData.photos.join(",") : undefined
    };

    if (isEditing && id) {
      updateMutation.mutate({
        id: parseInt(id),
        ...data
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotosChange = (photos: string[]) => {
    setFormData(prev => ({ ...prev, photos }));
  };

  if (isEditing && isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const auditors = auditorsData?.auditors || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate("/audits")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {isEditing ? "Editar Auditoria" : "Nova Auditoria"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Auditoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="timestamp">Data/Hora do Registro</Label>
                <Input
                  id="timestamp"
                  type="datetime-local"
                  value={formData.timestamp}
                  onChange={(e) => handleChange("timestamp", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="area">Área</Label>
                <Select value={formData.area} onValueChange={(value) => handleChange("area", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a área" />
                  </SelectTrigger>
                  <SelectContent>
                    {areasData?.areas?.map((area) => (
                      <SelectItem key={area.id} value={area.name}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="auditor">Auditor</Label>
                {auditors.length > 0 ? (
                  <Select value={formData.auditor} onValueChange={(value) => handleChange("auditor", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o auditor" />
                    </SelectTrigger>
                    <SelectContent>
                      {auditors.map((auditor) => (
                        <SelectItem key={auditor.id} value={auditor.name}>
                          {auditor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="space-y-2">
                    <Input
                      id="auditor"
                      value={formData.auditor}
                      onChange={(e) => handleChange("auditor", e.target.value)}
                      placeholder="Nome do auditor"
                      required
                    />
                    <p className="text-sm text-gray-500">
                      Nenhum auditor cadastrado. Você pode digitar o nome ou{" "}
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto text-blue-600"
                        onClick={() => window.open("/auditors", "_blank")}
                      >
                        cadastrar auditores aqui
                      </Button>
                    </p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="auditDate">Data da Auditoria</Label>
                <Input
                  id="auditDate"
                  type="date"
                  value={formData.auditDate}
                  onChange={(e) => handleChange("auditDate", e.target.value)}
                  required
                />
              </div>

              <div className="lg:col-span-2">
                <Label htmlFor="riskType">Tipo de Situação de Risco</Label>
                <Select value={formData.riskType} onValueChange={(value) => handleChange("riskType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de risco" />
                  </SelectTrigger>
                  <SelectContent>
                    {riskTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.riskType === "Outro" && (
                <div className="lg:col-span-2">
                  <Label htmlFor="customRiskType">Especifique o Tipo de Risco</Label>
                  <Input
                    id="customRiskType"
                    value={formData.customRiskType}
                    onChange={(e) => handleChange("customRiskType", e.target.value)}
                    placeholder="Descreva o tipo de situação de risco..."
                    required
                  />
                </div>
              )}

              <div>
                <Label htmlFor="potential">Potencial</Label>
                <Select value={formData.potential} onValueChange={(value) => handleChange("potential", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o potencial" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sem Desvio">Sem Desvio</SelectItem>
                    <SelectItem value="Baixo">Baixo</SelectItem>
                    <SelectItem value="Médio">Médio</SelectItem>
                    <SelectItem value="Alto">Alto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="responsible">Responsável pela Ação</Label>
                <Input
                  id="responsible"
                  value={formData.responsible}
                  onChange={(e) => handleChange("responsible", e.target.value)}
                  placeholder="Nome do responsável"
                  required
                />
              </div>

              <div>
                <Label htmlFor="deadline">Prazo</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleChange("deadline", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="status">Status da Ação</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                    <SelectItem value="Resolvido">Resolvido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6">
              <Label htmlFor="description">Descrição da Situação Insegura</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Descreva detalhadamente a situação encontrada..."
                rows={4}
                required
                className="mt-1"
              />
            </div>

            <div className="mt-6">
              <Label htmlFor="actionDescription">Ações Tomadas</Label>
              <Textarea
                id="actionDescription"
                value={formData.actionDescription}
                onChange={(e) => handleChange("actionDescription", e.target.value)}
                placeholder="Descreva as ações que foram tomadas para resolver a situação..."
                rows={4}
                required
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Descreva as medidas implementadas, correções realizadas ou planos de ação definidos.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fotos da Auditoria</CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoUpload
              photos={formData.photos}
              onPhotosChange={handlePhotosChange}
              maxPhotos={5}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate("/audits")} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={createMutation.isPending || updateMutation.isPending}
            className="w-full sm:w-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? "Atualizar" : "Criar"} Auditoria
          </Button>
        </div>
      </form>
    </div>
  );
}
