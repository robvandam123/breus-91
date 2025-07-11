
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function KPICard({ title, value, change, description, icon, className }: KPICardProps) {
  const getChangeColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'negative':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'neutral':
        return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800/20 dark:text-zinc-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800/20 dark:text-gray-400';
    }
  };

  return (
    <Card className={cn("relative overflow-hidden border-0 ios-card", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {title}
        </CardTitle>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </div>
        <div className="flex items-center justify-between">
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
          {change && (
            <Badge
              variant="secondary"
              className={cn(
                "text-xs font-medium px-2 py-1 rounded-lg border-0",
                getChangeColor(change.type)
              )}
            >
              {change.value}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
