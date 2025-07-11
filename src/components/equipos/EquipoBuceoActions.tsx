
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MoreHorizontal, Edit, Trash2, Users } from "lucide-react";
import { EditEquipoForm } from "./EditEquipoForm";
import { EquipoBuceoMemberManager } from "./EquipoBuceoMemberManager";
import { FormDialog } from "@/components/forms/FormDialog";
import { toast } from "@/hooks/use-toast";
import { useEquiposBuceoEnhanced } from "@/hooks/useEquiposBuceoEnhanced";

interface EquipoBuceoActionsProps {
  equipo: any;
  onEdit: (equipo: any) => void;
  onDelete: (equipoId: string) => void;
  onAddMember?: (equipoId: string) => void;
}

export const EquipoBuceoActions = ({ equipo, onEdit, onDelete, onAddMember }: EquipoBuceoActionsProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showMemberDialog, setShowMemberDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { updateEquipo, deleteEquipo } = useEquiposBuceoEnhanced();

  const handleEdit = async (data: any) => {
    try {
      await updateEquipo({ id: equipo.id, data });
      setShowEditDialog(false);
      toast({
        title: "Cuadrilla actualizada",
        description: "La cuadrilla ha sido actualizada exitosamente.",
      });
    } catch (error) {
      console.error('Error updating equipo:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la cuadrilla.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEquipo(equipo.id);
      setShowDeleteDialog(false);
      toast({
        title: "Cuadrilla eliminada",
        description: "La cuadrilla ha sido eliminada exitosamente.",
      });
    } catch (error) {
      console.error('Error deleting equipo:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la cuadrilla.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar cuadrilla
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowMemberDialog(true)}>
            <Users className="mr-2 h-4 w-4" />
            Gestionar miembros
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar cuadrilla
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <FormDialog
        variant="form"
        size="md"
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      >
        <EditEquipoForm
          equipo={equipo}
          onSubmit={handleEdit}
          onCancel={() => setShowEditDialog(false)}
        />
      </FormDialog>

      <FormDialog
        variant="form"
        size="xl"
        open={showMemberDialog}
        onOpenChange={setShowMemberDialog}
      >
        <EquipoBuceoMemberManager equipoId={equipo.id} equipo={equipo} />
      </FormDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la cuadrilla
              "{equipo.nombre}" y removerá todos sus miembros.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
