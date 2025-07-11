
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, FileText } from 'lucide-react';
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';
import type { OperacionConRelaciones } from '@/hooks/useOperacionesQuery';

interface OperacionesTableProps {
  operaciones: OperacionConRelaciones[];
  onEdit: (operacion: OperacionConRelaciones) => void;
  onView: (operacion: OperacionConRelaciones) => void;
  onDelete: (id: string) => Promise<void>;
  onViewDocuments: (operacion: OperacionConRelaciones) => void;
  isDeleting?: boolean;
}

export const OperacionesTable = ({
  operaciones,
  onEdit,
  onView,
  onDelete,
  onViewDocuments,
  isDeleting = false
}: OperacionesTableProps) => {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    operacion: OperacionConRelaciones | null;
  }>({
    open: false,
    operacion: null
  });

  const handleDeleteClick = (operacion: OperacionConRelaciones) => {
    setDeleteDialog({
      open: true,
      operacion
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteDialog.operacion) {
      await onDelete(deleteDialog.operacion.id);
      setDeleteDialog({ open: false, operacion: null });
    }
  };

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'activa':
        return 'default';
      case 'pausada':
        return 'secondary';
      case 'completada':
        return 'outline';
      case 'cancelada':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatFecha = (fecha?: string) => {
    if (!fecha) return 'No definida';
    return new Date(fecha).toLocaleDateString('es-CL');
  };

  return (
    <>
      <div className="rounded-2xl border border-gray-200/50 overflow-hidden bg-white/80 backdrop-blur-sm ios-card">
        <Table>
          <TableHeader className="bg-gray-50/80">
            <TableRow className="hover:bg-gray-50/50">
              <TableHead className="font-semibold text-gray-700">Código</TableHead>
              <TableHead className="font-semibold text-gray-700">Operación</TableHead>
              <TableHead className="font-semibold text-gray-700">Salmonera</TableHead>
              <TableHead className="font-semibold text-gray-700">Centro</TableHead>
              <TableHead className="font-semibold text-gray-700">Estado</TableHead>
              <TableHead className="font-semibold text-gray-700">Fecha Inicio</TableHead>
              <TableHead className="font-semibold text-gray-700">Fecha Fin</TableHead>
              <TableHead className="font-semibold text-gray-700 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operaciones.map((operacion) => (
              <TableRow key={operacion.id} className="hover:bg-blue-50/30 transition-colors">
                <TableCell>
                  <div className="font-mono text-sm text-gray-600">
                    {operacion.codigo}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-900">{operacion.nombre}</p>
                    {operacion.tareas && (
                      <p className="text-sm text-gray-600 truncate max-w-xs">
                        {operacion.tareas}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-gray-700">
                  {operacion.salmoneras?.nombre || 'No asignada'}
                </TableCell>
                <TableCell className="text-gray-700">
                  {operacion.centros?.nombre || 'No asignado'}
                </TableCell>
                <TableCell>
                  <Badge variant={getEstadoBadgeVariant(operacion.estado)}>
                    {operacion.estado.replace('_', ' ').toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-700">
                  {formatFecha(operacion.fecha_inicio)}
                </TableCell>
                <TableCell className="text-gray-700">
                  {formatFecha(operacion.fecha_fin)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(operacion)}
                      className="h-8 w-8 p-0 hover:bg-blue-100 ios-button"
                    >
                      <Eye className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDocuments(operacion)}
                      className="h-8 w-8 p-0 hover:bg-green-100 ios-button"
                    >
                      <FileText className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(operacion)}
                      className="h-8 w-8 p-0 hover:bg-orange-100 ios-button"
                    >
                      <Edit className="h-4 w-4 text-orange-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(operacion)}
                      className="h-8 w-8 p-0 hover:bg-red-100 ios-button"
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, operacion: null })}
        title="Eliminar Operación"
        description="¿Estás seguro de que deseas eliminar esta operación? Se eliminará toda la información asociada, incluyendo inmersiones y bitácoras."
        itemName={deleteDialog.operacion?.nombre || ''}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </>
  );
};
