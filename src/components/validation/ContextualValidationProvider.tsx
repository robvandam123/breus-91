
import React, { createContext, useContext, ReactNode } from 'react';
import { useEnhancedValidation } from '@/hooks/useEnhancedValidation';
import { useContextualValidator } from '@/hooks/useContextualValidator';

interface ValidationContextType {
  validateWithErrorHandling: ReturnType<typeof useEnhancedValidation>['validateWithErrorHandling'];
  validateOperationCode: ReturnType<typeof useEnhancedValidation>['validateOperationCode'];
  contextualValidator: ReturnType<typeof useContextualValidator>;
}

const ValidationContext = createContext<ValidationContextType | null>(null);

interface ContextualValidationProviderProps {
  children: ReactNode;
  operationId?: string;
}

export const ContextualValidationProvider: React.FC<ContextualValidationProviderProps> = ({
  children,
  operationId
}) => {
  const enhancedValidation = useEnhancedValidation();
  const contextualValidator = useContextualValidator(operationId);

  const value: ValidationContextType = {
    validateWithErrorHandling: enhancedValidation.validateWithErrorHandling,
    validateOperationCode: enhancedValidation.validateOperationCode,
    contextualValidator,
  };

  return (
    <ValidationContext.Provider value={value}>
      {children}
    </ValidationContext.Provider>
  );
};

export const useValidationContext = () => {
  const context = useContext(ValidationContext);
  if (!context) {
    throw new Error('useValidationContext must be used within a ContextualValidationProvider');
  }
  return context;
};
