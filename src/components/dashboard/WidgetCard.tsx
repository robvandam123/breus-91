
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, X, Settings } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import React from "react";

interface WidgetCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  isDraggable?: boolean;
  onRemove?: () => void;
  onConfigure?: () => void;
  isStatic?: boolean;
}

export const WidgetCard = ({ title, children, className, isDraggable = false, onRemove, onConfigure, isStatic = false }: WidgetCardProps) => {
  const cardId = React.useId();
  const titleId = `${cardId}-title`;
  const descriptionId = `${cardId}-desc`;

  return (
    <TooltipProvider>
      <Card
        className={cn(
          "w-full h-full flex flex-col overflow-hidden transition-shadow duration-200 border-0 ios-card",
          isDraggable && !isStatic ? "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1" : "",
          className
        )}
        role="group"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={isDraggable && !isStatic ? 0 : -1}
      >
        <span id={descriptionId} className="sr-only">
          Widget. {isDraggable && !isStatic ? "Modo edición activo. Use las flechas para navegar entre widgets. El widget se puede mover con el mouse usando la agarradera de arrastre." : ""}
        </span>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 sm:p-3 border-b bg-gray-50/50">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
            {isDraggable && !isStatic && (
              <Tooltip>
                <TooltipTrigger className="cursor-move drag-handle flex-shrink-0">
                  <GripVertical className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" aria-hidden="true" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Arrastrar para mover</p>
                </TooltipContent>
              </Tooltip>
            )}
            <CardTitle id={titleId} className="text-xs sm:text-sm font-medium truncate text-gray-700">
              {title}
            </CardTitle>
          </div>
          {isDraggable && !isStatic && (
            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
              {onConfigure && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-4 w-4 sm:h-5 sm:w-5 group" onClick={onConfigure} aria-label={`Configurar widget ${title}`}>
                        <Settings className="w-2.5 h-2.5 sm:w-3 sm:h-3 transition-transform duration-300 group-hover:rotate-45" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Configurar widget</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {onRemove && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-4 w-4 sm:h-5 sm:w-5 group" onClick={onRemove} aria-label={`Quitar widget ${title}`}>
                        <X className="w-2.5 h-2.5 sm:w-3 sm:h-3 transition-colors duration-200 group-hover:text-red-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Quitar widget</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-1.5 sm:p-2 md:p-3">
          {children}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
