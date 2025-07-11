
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Save, FileText } from "lucide-react";
import { BitacoraStep1 } from './steps/BitacoraStep1';
import { BitacoraStep2Buzos } from './steps/BitacoraStep2Buzos';
import { BitacoraStep3Equipos } from './steps/BitacoraStep3Equipos';
import { BitacoraStep4Trabajos } from './steps/BitacoraStep4Trabajos';
import { BitacoraStep5DatosBuzos } from './steps/BitacoraStep5DatosBuzos';
import { BitacoraStep6Firmas } from './steps/BitacoraStep6Firmas';
import { useInmersiones } from '@/hooks/useInmersiones';
import { useEquiposBuceoEnhanced } from '@/hooks/useEquiposBuceoEnhanced';
import { useOperaciones } from '@/hooks/useOperaciones';

export interface BitacoraSupervisorData {
  // Información básica
  codigo: string;
  fecha_inicio_faena?: string;
  fecha_termino_faena?: string;
  lugar_trabajo?: string;
  supervisor_nombre_matricula?: string;
  estado_mar?: string;
  visibilidad_fondo?: number;
  hora_inicio_faena?: string;
  hora_termino_faena?: string;
  desarrollo_inmersion: string;
  incidentes?: string;
  evaluacion_general: string;
  
  // Inmersión relacionada
  inmersion_id: string;
  supervisor?: string;
  
  // Buzos y asistentes (Paso 2)
  inmersiones_buzos?: Array<{
    id?: string;
    nombre: string;
    apellido?: string;
    rut: string;
    rol: string;
    profundidad_trabajo?: number;
    tiempo_inmersion?: number;
    profundidad_maxima?: number;
    tiempo_fondo?: number;
    tiempo_descompresion?: number;
    hora_entrada_agua?: string;
    hora_salida_agua?: string;
    observaciones?: string;
    del_equipo_buceo: boolean;
  }>;
  buzos_asistentes?: Array<{
    nombre: string;
    apellido: string;
    rut: string;
    rol: string;
    del_equipo_buceo: boolean;
  }>;
  
  // Equipos utilizados (Paso 3)
  equipos_utilizados?: Array<{
    nombre: string;
    tipo: string;
    estado: string;
    observaciones?: string;
  }>;
  
  // Trabajos realizados (Paso 4)
  trabajo_a_realizar?: string;
  descripcion_trabajo?: string;
  observaciones_generales_texto?: string;
  embarcacion_apoyo?: string;
  
  // Datos detallados del buceo (Paso 5)
  diving_records?: Array<{
    buzo_nombre: string;
    profundidad_maxima: number;
    tiempo_fondo: number;
    tiempo_descompresion: number;
    equipos_usados: string[];
    observaciones?: string;
    rol?: string;
  }>;
  
  // Control y validación
  validacion_contratista?: boolean;
  comentarios_validacion?: string;
  operacion_id?: string;
  empresa_nombre?: string;
  centro_nombre?: string;
  equipo_buceo_id?: string;
}

interface BitacoraWizardFromInmersionProps {
  inmersionId: string;
  onComplete: (data: BitacoraSupervisorData) => void;
  onCancel: () => void;
}

export const BitacoraWizardFromInmersion = ({ 
  inmersionId, 
  onComplete, 
  onCancel 
}: BitacoraWizardFromInmersionProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BitacoraSupervisorData>({
    codigo: `BS-${Date.now()}`,
    inmersion_id: inmersionId,
    desarrollo_inmersion: '',
    evaluacion_general: '',
    inmersiones_buzos: [],
    buzos_asistentes: [],
    equipos_utilizados: [],
    diving_records: []
  });
  
  const { inmersiones } = useInmersiones();
  const { equipos } = useEquiposBuceoEnhanced();
  const { operaciones } = useOperaciones();
  
  const selectedInmersion = inmersiones.find(i => i.inmersion_id === inmersionId);
  const selectedOperation = selectedInmersion ? operaciones.find(op => op.id === selectedInmersion.operacion_id) : null;
  
  // Since operations no longer have direct team assignments, we need to find available teams
  const availableTeams = equipos || [];
  const assignedTeam = availableTeams.length > 0 ? availableTeams[0] : null; // Use first available team as fallback

  // Auto-poblar datos de la inmersión y personal de buceo
  useEffect(() => {
    if (selectedInmersion && selectedOperation) {
      // Auto-poblar buzos del personal usando las propiedades correctas
      const buzosEquipo = assignedTeam?.miembros?.filter(miembro => {
        // Usar 'any' temporalmente para acceder a las propiedades
        const miembroAny = miembro as any;
        const rol = (miembroAny.rol_equipo || miembroAny.rol || 'buzo').toLowerCase();
        return rol === 'buzo' || rol === 'buzo_principal' || rol === 'buzo_asistente';
      }).map(miembro => {
        // Usar 'any' temporalmente para acceder a las propiedades
        const miembroAny = miembro as any;
        
        // Intentar obtener el nombre de diferentes formas
        const nombreCompleto = miembroAny.usuario?.nombre_completo || 
                              miembroAny.nombre_completo ||
                              (miembroAny.usuario?.nombre && miembroAny.usuario?.apellido 
                                ? `${miembroAny.usuario.nombre} ${miembroAny.usuario.apellido}` 
                                : miembroAny.nombre || 'Sin nombre');
        
        // Separar nombre y apellido
        const [nombre, ...apellidoParts] = nombreCompleto.split(' ');
        const apellido = apellidoParts.join(' ');
        
        const rol = miembroAny.rol_equipo || miembroAny.rol || 'Buzo';
        
        return {
          id: miembroAny.id || miembroAny.usuario_id || `temp_${Date.now()}_${Math.random()}`,
          nombre: nombre || 'Sin nombre',
          apellido: apellido || '',
          rut: miembroAny.usuario?.perfil_buzo?.rut || miembroAny.rut || '',
          rol: rol,
          profundidad_trabajo: 0,
          tiempo_inmersion: 0,
          profundidad_maxima: 0,
          tiempo_fondo: 0,
          tiempo_descompresion: 0,
          hora_entrada_agua: '',
          hora_salida_agua: '',
          observaciones: '',
          del_equipo_buceo: true
        };
      }) || [];

      setFormData(prev => ({
        ...prev,
        lugar_trabajo: selectedOperation.nombre,
        supervisor: selectedInmersion.supervisor,
        supervisor_nombre_matricula: selectedInmersion.supervisor,
        operacion_id: selectedOperation.id,
        inmersiones_buzos: buzosEquipo,
        fecha_inicio_faena: selectedInmersion.fecha_inmersion
      }));
    }
  }, [selectedInmersion, selectedOperation, assignedTeam]);

  const steps = [
    { id: 1, title: "Información General", description: "Datos básicos de la bitácora" },
    { id: 2, title: "Buzos y Datos", description: "Personal buzo y datos de inmersión" },
    { id: 3, title: "Equipos Utilizados", description: "Equipos y herramientas" },
    { id: 4, title: "Trabajos Realizados", description: "Descripción de actividades" },
    { id: 5, title: "Resumen y Validación", description: "Resumen final y validación" },
    { id: 6, title: "Firmas", description: "Firmas digitales" }
  ];

  const totalSteps = steps.length;
  const progress = (currentStep / totalSteps) * 100;

  const updateFormData = (newData: Partial<BitacoraSupervisorData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.codigo && formData.desarrollo_inmersion && formData.evaluacion_general);
      case 2:
        return formData.inmersiones_buzos ? formData.inmersiones_buzos.length > 0 : false;
      case 3:
        return true; // Equipos son opcionales
      case 4:
        return !!(formData.trabajo_a_realizar || formData.descripcion_trabajo);
      case 5:
        return true; // Resumen y validación
      case 6:
        return true; // Firmas
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      onComplete(formData);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BitacoraStep1 
            data={formData} 
            onUpdate={updateFormData}
          />
        );
      case 2:
        return (
          <BitacoraStep2Buzos 
            data={formData} 
            onUpdate={updateFormData}
            equipoBuceo={assignedTeam}
          />
        );
      case 3:
        return (
          <BitacoraStep3Equipos 
            data={formData} 
            onUpdate={updateFormData}
          />
        );
      case 4:
        return (
          <BitacoraStep4Trabajos 
            data={formData} 
            onUpdate={updateFormData}
          />
        );
      case 5:
        return (
          <BitacoraStep5DatosBuzos 
            data={formData} 
            onUpdate={updateFormData}
          />
        );
      case 6:
        return (
          <BitacoraStep6Firmas 
            data={formData} 
            onUpdate={updateFormData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Bitácora de Supervisor - {selectedInmersion?.codigo || 'Nueva'}
            </CardTitle>
            <CardDescription>
              Paso {currentStep} de {totalSteps}: {steps[currentStep - 1]?.title}
              {assignedTeam && (
                <div className="mt-1 text-xs text-blue-600">
                  Personal de Buceo: {assignedTeam.nombre}
                </div>
              )}
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
        <Progress value={progress} className="w-full mt-4" />
      </CardHeader>

      <CardContent>
        {renderStepContent()}

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <div className="flex gap-2">
            {currentStep < totalSteps ? (
              <Button onClick={handleNext}>
                Siguiente
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                <Save className="h-4 w-4 mr-2" />
                Finalizar Bitácora
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
