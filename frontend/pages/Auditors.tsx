import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import backend from "~backend/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  Save,
  X
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { Auditor } from "~backend/auditor/types";

// Utility function to format date in Brasília timezone
const formatBrasiliaDate = (date: Date | string) => {
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

export default function Auditors() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingAuditor, setEditingAuditor] = useState<Auditor | null>(null);
  const [formData, setFormData] = useState({ name: "" });

  const { data: auditorsData, isLoading } = useQuery({
    queryKey: ["auditors"],
    queryFn: async () => {
      try {
        return await backend.auditor.list();
      } catch (error) {
        console.error("Failed to fetch auditors:", error);
        toast({
          title: "Erro",
          description: "Falha ao carregar auditores",
          variant: "destructive",
        });
        throw error;
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      return await backend.auditor.create({ name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auditors"] });
      setFormData({ name: "" });
      setShowForm(false);
      toast({
        title: "Sucesso",
        description: "Auditor criado com sucesso",
      });
    },
    onError: (error: any) => {
      console.error("Failed to create auditor:", error);
      const message = error.message?.includes("already exists") 
        ? "Já existe um auditor com este nome"
        : "Falha ao criar auditor";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      return await backend.auditor.update({ id, name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auditors"] });
      setFormData({ name: "" });
      setEditingAuditor(null);
      toast({
        title: "Sucesso",
        description: "Auditor atualizado com sucesso",
      });
    },
    onError: (error: any) => {
      console.error("Failed to update auditor:", error);
      const message = error.message?.includes("already exists") 
        ? "Já existe um auditor com este nome"
        : "Falha ao atualizar auditor";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await backend.auditor.deleteAuditor({ id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auditors"] });
      toast({
        title: "Sucesso",
        description: "Auditor excluído com sucesso",
      });
    },
    onError: (error) => {
      console.error("Failed to delete auditor:", error);
      toast({
        title: "Erro",
        description: "Falha ao excluir auditor",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do auditor é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (editingAuditor) {
      updateMutation.mutate({ id: editingAuditor.id, name: formData.name.trim() });
    } else {
      createMutation.mutate(formData.name.trim());
    }
  };

  const handleEdit = (auditor: Auditor) => {
    setEditingAuditor(auditor);
    setFormData({ name: auditor.name });
    setShowForm(true);
  };

  const handleDelete = (auditor: Auditor) => {
    if (window.confirm(`Tem certeza que deseja excluir o auditor "${auditor.name}"?`)) {
      deleteMutation.mutate(auditor.id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAuditor(null);
    setFormData({ name: "" });
  };

  const auditors = auditorsData?.auditors || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Auditores</h1>
        <Button 
          onClick={() => setShowForm(true)}
          disabled={showForm}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Auditor
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingAuditor ? "Editar Auditor" : "Novo Auditor"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Auditor</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  placeholder="Digite o nome do auditor..."
                  required
                  autoFocus
                />
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  className="w-full sm:w-auto"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingAuditor ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Lista de Auditores ({auditors.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : auditors.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">Nenhum auditor cadastrado</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar primeiro auditor
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {auditors.map((auditor) => (
                <div
                  key={auditor.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors space-y-3 sm:space-y-0"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {auditor.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Cadastrado em {formatBrasiliaDate(auditor.createdAt)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 sm:ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(auditor)}
                      disabled={showForm}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="ml-1 sm:hidden">Editar</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(auditor)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="ml-1 sm:hidden">Excluir</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
