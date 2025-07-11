
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Salmonera {
  id: string;
  nombre: string;
  rut: string;
  direccion: string;
  telefono?: string;
  email?: string;
  estado: string;
  sitios_activos?: number;
  created_at: string;
  updated_at: string;
}

export interface SalmoneraFormData {
  nombre: string;
  rut: string;
  direccion: string;
  telefono?: string;
  email?: string;
  estado: 'activa' | 'inactiva' | 'suspendida';
}

export const useSalmoneras = () => {
  const queryClient = useQueryClient();

  const { data: salmoneras = [], isLoading, error } = useQuery({
    queryKey: ['salmoneras'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salmoneras')
        .select('*')
        .eq('estado', 'activa')
        .order('nombre');

      if (error) throw error;
      return data as Salmonera[];
    },
  });

  const createSalmonera = useMutation({
    mutationFn: async (formData: SalmoneraFormData) => {
      const { data, error } = await supabase
        .from('salmoneras')
        .insert([formData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salmoneras'] });
      toast({
        title: "Salmonera creada",
        description: "La salmonera ha sido creada exitosamente.",
      });
    },
    onError: (error) => {
      console.error('Error creating salmonera:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la salmonera.",
        variant: "destructive",
      });
    },
  });

  const updateSalmonera = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SalmoneraFormData }) => {
      const { error } = await supabase
        .from('salmoneras')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salmoneras'] });
      toast({
        title: "Salmonera actualizada",
        description: "La salmonera ha sido actualizada exitosamente.",
      });
    },
    onError: (error) => {
      console.error('Error updating salmonera:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la salmonera.",
        variant: "destructive",
      });
    },
  });

  const deleteSalmonera = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('salmoneras')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salmoneras'] });
      toast({
        title: "Salmonera eliminada",
        description: "La salmonera ha sido eliminada exitosamente.",
      });
    },
    onError: (error) => {
      console.error('Error deleting salmonera:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la salmonera.",
        variant: "destructive",
      });
    },
  });

  return {
    salmoneras,
    isLoading,
    error,
    createSalmonera: createSalmonera.mutateAsync,
    updateSalmonera: updateSalmonera.mutateAsync,
    deleteSalmonera: deleteSalmonera.mutateAsync,
  };
};
