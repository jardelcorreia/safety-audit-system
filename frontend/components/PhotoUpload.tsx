import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import backend from "~backend/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  X, 
  Camera, 
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

// Utility function to resize image
const resizeImage = (file: File, maxWidth: number = 1200, maxHeight: number = 800, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          } else {
            resolve(file);
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.src = URL.createObjectURL(file);
  });
};

export default function PhotoUpload({ photos, onPhotosChange, maxPhotos = 5 }: PhotoUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // Resize image before upload
      const resizedFile = await resizeImage(file);
      
      // Get upload URL
      const { uploadUrl, fileUrl } = await backend.audit.getUploadUrl({
        filename: resizedFile.name,
        contentType: resizedFile.type
      });

      // Upload file to signed URL
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: resizedFile,
        headers: {
          'Content-Type': resizedFile.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      return fileUrl;
    },
    onSuccess: (fileUrl) => {
      onPhotosChange([...photos, fileUrl]);
      toast({
        title: "Sucesso",
        description: "Foto enviada com sucesso",
      });
    },
    onError: (error) => {
      console.error("Failed to upload photo:", error);
      toast({
        title: "Erro",
        description: "Falha ao enviar foto",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (photos.length + files.length > maxPhotos) {
      toast({
        title: "Limite excedido",
        description: `Máximo de ${maxPhotos} fotos permitidas`,
        variant: "destructive",
      });
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Arquivo inválido",
          description: "Apenas imagens são permitidas",
          variant: "destructive",
        });
        continue;
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB limit for original file
        toast({
          title: "Arquivo muito grande",
          description: "Tamanho máximo: 50MB",
          variant: "destructive",
        });
        continue;
      }

      uploadMutation.mutate(file);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
        <label className="text-sm font-medium text-gray-700">
          Fotos ({photos.length}/{maxPhotos})
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={triggerFileSelect}
          disabled={photos.length >= maxPhotos || uploadMutation.isPending}
          className="w-full sm:w-auto"
        >
          {uploadMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          Adicionar Foto
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploadMutation.isPending && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <div className="flex-1">
                <p className="text-sm font-medium">Redimensionando e enviando foto...</p>
                <p className="text-xs text-gray-500 mt-1">
                  A imagem será automaticamente otimizada para reduzir o tamanho
                </p>
                <Progress value={50} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-2">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                  <img
                    src={photo}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover"
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
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removePhoto(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {photos.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8">
            <div className="text-center">
              <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">Nenhuma foto adicionada</p>
              <p className="text-xs text-gray-400 mb-4">
                As fotos serão automaticamente redimensionadas para otimizar o armazenamento
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={triggerFileSelect}
                disabled={uploadMutation.isPending}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Adicionar primeira foto
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
