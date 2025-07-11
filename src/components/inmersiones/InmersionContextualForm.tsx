import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { useIndependentOperations } from "@/hooks/useIndependentOperations";
import { useAuth } from "@/hooks/useAuth";
import { useCompanyContext } from "@/hooks/useCompanyContext";
import { UniversalCompanySelector } from "@/components/common/UniversalCompanySelector";
import { AlertCircle, CheckCircle, Info, Waves } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface InmersionContextualFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  operacionId?: string;
  editingInmersion?: any;
}

export const InmersionContextualForm = ({ 
  onSuccess, 
  onCancel, 
  operacionId,
  editingInmersion 
}: InmersionContextualFormProps) => {
  const { profile } = useAuth();
  const { context, requiresCompanySelection, canCreateRecords } = useCompanyContext();
  
  const [formData, setFormData] = useState({
    codigo: editingInmersion?.codigo || '',
    fecha_inmersion: editingInmersion?.fecha_inmersion || new Date().toISOString().split('T')[0],
    hora_inicio: editingInmersion?.hora_inicio || '',
    hora_fin: editingInmersion?.hora_fin || '',
    buzo_principal: editingInmersion?.buzo_principal || '',
    buzo_asistente: editingInmersion?.buzo_asistente || '',
    supervisor: editingInmersion?.supervisor || '',
    objetivo: editingInmersion?.objetivo || '',
    profundidad_max: editingInmersion?.profundidad_max || 0,
    temperatura_agua: editingInmersion?.temperatura_agua || 0,
    visibilidad: editingInmersion?.visibilidad || 0,
    corriente: editingInmersion?.corriente || '',
    observaciones: editingInmersion?.observaciones || '',
    operacion_descripcion: editingInmersion?.operacion_descripcion || '', // Nuevo campo para descripción
    context_type: (editingInmersion?.context_type || 'direct') as 'planned' | 'direct',
    operacion_id: operacionId || editingInmersion?.operacion_id || null,
    planned_bottom_time: editingInmersion?.planned_bottom_time || 0
  });

  const [isIndependent, setIsIndependent] = useState(!operacionId && !editingInmersion?.operacion_id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const { 
    loading, 
    operationalContext, 
    createIndependentInmersion, 
    canAccessFeature 
  } = useIndependentOperations();

  // Verificar si el usuario puede crear inmersiones independientes
  const canCreateIndependent = () => {
    // Si tiene módulo de planning activo, puede crear ambos tipos
    if (context.selectedCompany?.modulos?.includes('planning_operations')) {
      return true;
    }
    
    // Si no tiene planning pero puede crear inmersiones directas (core)
    return canAccessFeature('create_immersion');
  };

  // Validación mejorada - solo básica
  const validateForm = () => {
    const requiredFields = [
      'codigo', 'fecha_inmersion', 'hora_inicio', 'buzo_principal', 
      'supervisor', 'objetivo', 'corriente'
    ];

    // Para inmersiones independientes, requerir descripción de operación
    if (isIndependent) {
      requiredFields.push('operacion_descripcion');
    }

    const hasEmptyFields = requiredFields.some(field => {
      const value = formData[field as keyof typeof formData];
      return !value || (typeof value === 'string' && !value.trim());
    });

    const hasInvalidNumbers = 
      formData.profundidad_max <= 0 || 
      formData.temperatura_agua <= 0 || 
      formData.visibilidad <= 0;

    const hasCompanyIssue = requiresCompanySelection() && !context.selectedCompany;

    return {
      isValid: !hasEmptyFields && !hasInvalidNumbers && !hasCompanyIssue,
      hasEmptyFields,
      hasInvalidNumbers,
      hasCompanyIssue
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    
    const validation = validateForm();
    
    if (!validation.isValid) {
      if (validation.hasCompanyIssue) {
        toast({
          title: "Empresa requerida",
          description: "Debes seleccionar una empresa antes de crear la inmersión",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Campos requeridos",
          description: "Por favor complete todos los campos obligatorios",
          variant: "destructive",
        });
      }
      return;
    }

    if (!canCreateRecords()) {
      toast({
        title: "Empresa requerida",
        description: "Debes seleccionar una empresa antes de crear la inmersión",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Preparar datos limpios
      const cleanFormData = {
        codigo: formData.codigo,
        fecha_inmersion: formData.fecha_inmersion,
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin || null,
        buzo_principal: formData.buzo_principal,
        buzo_asistente: formData.buzo_asistente || null,
        supervisor: formData.supervisor,
        objetivo: formData.objetivo,
        profundidad_max: formData.profundidad_max,
        temperatura_agua: formData.temperatura_agua,
        visibilidad: formData.visibilidad,
        corriente: formData.corriente,
        observaciones: formData.observaciones || '',
        estado: 'planificada',
        planned_bottom_time: formData.planned_bottom_time || null,
        context_type: isIndependent ? 'direct' as const : 'planned' as const,
        operacion_id: isIndependent ? null : formData.operacion_id,
        is_independent: isIndependent,
        company_id: context.selectedCompany?.id || context.companyId,
        company_type: context.selectedCompany?.tipo || context.companyType,
        ...(isIndependent && formData.operacion_descripcion && {
          observaciones: `Operación: ${formData.operacion_descripcion}\n${formData.observaciones || ''}`.trim()
        })
      };

      console.log('Submitting clean inmersion data:', cleanFormData);
      
      if (isIndependent) {
        await createIndependentInmersion(cleanFormData);
      } else {
        const { data, error } = await supabase
          .from('inmersion')
          .insert([cleanFormData])
          .select()
          .single();

        if (error) {
          console.error('Database error:', error);
          throw error;
        }
        
        toast({
          title: "Inmersión creada",
          description: "La inmersión ha sido creada exitosamente.",
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error creating inmersion:', error);
      
      let errorMessage = "No se pudo crear la inmersión.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getContextBadge = () => {
    if (isIndependent) {
      return <Badge className="bg-green-100 text-green-800">Independiente</Badge>;
    }
    
    if (!operationalContext) return null;

    switch (operationalContext.context_type) {
      case 'planned':
        return <Badge className="bg-blue-100 text-blue-800">Planificado</Badge>;
      case 'direct':
        return <Badge className="bg-green-100 text-green-800">Directo</Badge>;
      case 'mixed':
        return <Badge className="bg-purple-100 text-purple-800">Mixto</Badge>;
      default:
        return null;
    }
  };

  const validation = validateForm();
  const shouldShowValidationErrors = hasAttemptedSubmit && !validation.isValid;

  if (context.isLoading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6 text-center">
          <p>Cargando contexto empresarial...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Waves className="w-6 h-6 text-blue-600" />
              {editingInmersion ? 'Editar Inmersión' : 'Nueva Inmersión'}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Tipo: {getContextBadge()}
            </p>
          </div>
          
          {!operacionId && canCreateIndependent() && (
            <div className="flex items-center gap-2">
              <Label htmlFor="independent-switch" className="text-sm">
                {isIndependent ? 'Independiente' : 'Con Operación'}
              </Label>
              <Switch
                id="independent-switch"
                checked={isIndependent}
                onCheckedChange={setIsIndependent}
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Selector de empresa universal con estilos consistentes */}
        <div className="mb-6">
          <UniversalCompanySelector 
            title="Empresa para esta Inmersión"
            description="Especifica la empresa para la cual se realizará esta inmersión"
          />
        </div>

        {shouldShowValidationErrors && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <p className="font-medium text-red-800">
                Por favor complete todos los campos obligatorios marcados con *
              </p>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="codigo" className={shouldShowValidationErrors && !formData.codigo ? 'text-red-600' : ''}>
                Código de Inmersión *
              </Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData(prev => ({...prev, codigo: e.target.value}))}
                placeholder="Ej: INM-2024-001"
                className={shouldShowValidationErrors && !formData.codigo ? 'border-red-300' : ''}
                required
              />
            </div>

            <div>
              <Label htmlFor="fecha" className={shouldShowValidationErrors && !formData.fecha_inmersion ? 'text-red-600' : ''}>
                Fecha de Inmersión *
              </Label>
              <Input
                id="fecha"
                type="date"
                value={formData.fecha_inmersion}
                onChange={(e) => setFormData(prev => ({...prev, fecha_inmersion: e.target.value}))}
                className={shouldShowValidationErrors && !formData.fecha_inmersion ? 'border-red-300' : ''}
                required
              />
            </div>
          </div>

          {/* Descripción de operación para inmersiones independientes */}
          {isIndependent && (
            <div>
              <Label htmlFor="operacion_descripcion" className={shouldShowValidationErrors && !formData.operacion_descripcion ? 'text-red-600' : ''}>
                Descripción de la Operación *
              </Label>
              <Input
                id="operacion_descripcion"
                value={formData.operacion_descripcion}
                onChange={(e) => setFormData(prev => ({...prev, operacion_descripcion: e.target.value}))}
                placeholder="Ej: Inspección de cascos, Mantenimiento de redes, etc."
                className={shouldShowValidationErrors && !formData.operacion_descripcion ? 'border-red-300' : ''}
                required
              />
              <p className="text-sm text-gray-600 mt-1">
                Describe brevemente el tipo de operación que se realizará
              </p>
            </div>
          )}

          {/* Time Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="hora_inicio" className={shouldShowValidationErrors && !formData.hora_inicio ? 'text-red-600' : ''}>
                Hora de Inicio *
              </Label>
              <Input
                id="hora_inicio"
                type="time"
                value={formData.hora_inicio}
                onChange={(e) => setFormData(prev => ({...prev, hora_inicio: e.target.value}))}
                className={shouldShowValidationErrors && !formData.hora_inicio ? 'border-red-300' : ''}
                required
              />
            </div>

            <div>
              <Label htmlFor="hora_fin">Hora de Fin (Estimada)</Label>
              <Input
                id="hora_fin"
                type="time"
                value={formData.hora_fin}
                onChange={(e) => setFormData(prev => ({...prev, hora_fin: e.target.value}))}
              />
            </div>

            <div>
              <Label htmlFor="planned_bottom_time">Tiempo Fondo Planificado (min)</Label>
              <Input
                id="planned_bottom_time"
                type="number"
                min="0"
                value={formData.planned_bottom_time}
                onChange={(e) => setFormData(prev => ({...prev, planned_bottom_time: parseInt(e.target.value) || 0}))}
              />
            </div>
          </div>

          {/* Personnel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="buzo_principal" className={shouldShowValidationErrors && !formData.buzo_principal ? 'text-red-600' : ''}>
                Buzo Principal *
              </Label>
              <Input
                id="buzo_principal"
                value={formData.buzo_principal}
                onChange={(e) => setFormData(prev => ({...prev, buzo_principal: e.target.value}))}
                placeholder="Nombre del buzo principal"
                className={shouldShowValidationErrors && !formData.buzo_principal ? 'border-red-300' : ''}
                required
              />
            </div>

            <div>
              <Label htmlFor="buzo_asistente">Buzo Asistente</Label>
              <Input
                id="buzo_asistente"
                value={formData.buzo_asistente}
                onChange={(e) => setFormData(prev => ({...prev, buzo_asistente: e.target.value}))}
                placeholder="Nombre del buzo asistente"
              />
            </div>

            <div>
              <Label htmlFor="supervisor" className={shouldShowValidationErrors && !formData.supervisor ? 'text-red-600' : ''}>
                Supervisor *
              </Label>
              <Input
                id="supervisor"
                value={formData.supervisor}
                onChange={(e) => setFormData(prev => ({...prev, supervisor: e.target.value}))}
                placeholder="Nombre del supervisor"
                className={shouldShowValidationErrors && !formData.supervisor ? 'border-red-300' : ''}
                required
              />
            </div>
          </div>

          {/* Work Details */}
          <div>
            <Label htmlFor="objetivo" className={shouldShowValidationErrors && !formData.objetivo ? 'text-red-600' : ''}>
              Objetivo de la Inmersión *
            </Label>
            <Select 
              value={formData.objetivo} 
              onValueChange={(value) => setFormData(prev => ({...prev, objetivo: value}))}
            >
              <SelectTrigger className={shouldShowValidationErrors && !formData.objetivo ? 'border-red-300' : ''}>
                <SelectValue placeholder="Selecciona el objetivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                <SelectItem value="inspeccion">Inspección</SelectItem>
                <SelectItem value="reparacion">Reparación</SelectItem>
                <SelectItem value="instalacion">Instalación</SelectItem>
                <SelectItem value="limpieza">Limpieza</SelectItem>
                <SelectItem value="soldadura">Soldadura</SelectItem>
                <SelectItem value="corte">Corte</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Environmental Conditions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="profundidad" className={shouldShowValidationErrors && formData.profundidad_max <= 0 ? 'text-red-600' : ''}>
                Profundidad Máxima (m) *
              </Label>
              <Input
                id="profundidad"
                type="number"
                step="0.1"
                min="0.1"
                value={formData.profundidad_max}
                onChange={(e) => setFormData(prev => ({...prev, profundidad_max: parseFloat(e.target.value) || 0}))}
                className={shouldShowValidationErrors && formData.profundidad_max <= 0 ? 'border-red-300' : ''}
                required
              />
            </div>

            <div>
              <Label htmlFor="temperatura" className={shouldShowValidationErrors && formData.temperatura_agua <= 0 ? 'text-red-600' : ''}>
                Temperatura del Agua (°C) *
              </Label>
              <Input
                id="temperatura"
                type="number"
                step="0.1"
                min="0.1"
                value={formData.temperatura_agua}
                onChange={(e) => setFormData(prev => ({...prev, temperatura_agua: parseFloat(e.target.value) || 0}))}
                className={shouldShowValidationErrors && formData.temperatura_agua <= 0 ? 'border-red-300' : ''}
                required
              />
            </div>

            <div>
              <Label htmlFor="visibilidad" className={shouldShowValidationErrors && formData.visibilidad <= 0 ? 'text-red-600' : ''}>
                Visibilidad (m) *
              </Label>
              <Input
                id="visibilidad"
                type="number"
                step="0.1"
                min="0.1"
                value={formData.visibilidad}
                onChange={(e) => setFormData(prev => ({...prev, visibilidad: parseFloat(e.target.value) || 0}))}
                className={shouldShowValidationErrors && formData.visibilidad <= 0 ? 'border-red-300' : ''}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="corriente" className={shouldShowValidationErrors && !formData.corriente ? 'text-red-600' : ''}>
              Condiciones de Corriente *
            </Label>
            <Select 
              value={formData.corriente} 
              onValueChange={(value) => setFormData(prev => ({...prev, corriente: value}))}
            >
              <SelectTrigger className={shouldShowValidationErrors && !formData.corriente ? 'border-red-300' : ''}>
                <SelectValue placeholder="Selecciona las condiciones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nula">Nula</SelectItem>
                <SelectItem value="leve">Leve</SelectItem>
                <SelectItem value="moderada">Moderada</SelectItem>
                <SelectItem value="fuerte">Fuerte</SelectItem>
                <SelectItem value="muy_fuerte">Muy Fuerte</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Observations */}
          <div>
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => setFormData(prev => ({...prev, observaciones: e.target.value}))}
              placeholder="Observaciones adicionales sobre la inmersión..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || isSubmitting || !canCreateRecords()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Creando...' : (editingInmersion ? 'Actualizar' : 'Crear Inmersión')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
