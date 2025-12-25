import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  path: string;
  gradient?: boolean;
}

export function FeatureCard({ icon: Icon, title, description, path, gradient }: FeatureCardProps) {
  return (
    <Link
      to={path}
      className={cn(
        'group relative flex flex-col items-center gap-3 rounded-2xl p-6 text-center transition-all duration-300 hover:scale-[1.02] animate-fade-in',
        gradient
          ? 'gradient-primary text-primary-foreground shadow-soft'
          : 'bg-card shadow-card hover:shadow-elevated'
      )}
    >
      <div
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-xl transition-transform group-hover:scale-110',
          gradient
            ? 'bg-primary-foreground/20'
            : 'bg-accent'
        )}
      >
        <Icon className={cn('h-7 w-7', gradient ? 'text-primary-foreground' : 'text-primary')} />
      </div>
      <div>
        <h3 className={cn('font-semibold', gradient ? 'text-primary-foreground' : 'text-foreground')}>
          {title}
        </h3>
        <p className={cn('mt-1 text-sm', gradient ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
          {description}
        </p>
      </div>
    </Link>
  );
}
