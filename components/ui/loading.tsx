import { cn } from "@/lib/utils";
import { Loader2, RefreshCw } from "lucide-react";

interface LoadingProps {
    variant?: 'default' | 'spinner' | 'pulse';
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    className?: string;
    fullScreen?: boolean;
}

export function Loading({
    variant = 'default',
    size = 'md',
    text,
    className,
    fullScreen = false
}: LoadingProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12'
    };

    const textSizes = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
    };

    const variants = {
        default: (
            <div className={cn(
                "flex flex-col items-center justify-center gap-2",
                fullScreen && "min-h-screen",
                className
            )}>
                <Loader2 className={cn(
                    "animate-spin text-primary",
                    sizeClasses[size]
                )} />
                {text && (
                    <p className={cn(
                        "text-muted-foreground animate-pulse",
                        textSizes[size]
                    )}>
                        {text}
                    </p>
                )}
            </div>
        ),
        spinner: (
            <div className={cn(
                "flex flex-col items-center justify-center gap-2",
                fullScreen && "min-h-screen",
                className
            )}>
                <RefreshCw className={cn(
                    "animate-spin text-primary",
                    sizeClasses[size]
                )} />
                {text && (
                    <p className={cn(
                        "text-muted-foreground animate-pulse",
                        textSizes[size]
                    )}>
                        {text}
                    </p>
                )}
            </div>
        ),
        pulse: (
            <div className={cn(
                "flex flex-col items-center justify-center gap-2",
                fullScreen && "min-h-screen",
                className
            )}>
                <div className={cn(
                    "rounded-full bg-primary/20 animate-pulse",
                    size === 'sm' && "h-4 w-4",
                    size === 'md' && "h-8 w-8",
                    size === 'lg' && "h-12 w-12"
                )} />
                {text && (
                    <p className={cn(
                        "text-muted-foreground animate-pulse",
                        textSizes[size]
                    )}>
                        {text}
                    </p>
                )}
            </div>
        )
    };

    return variants[variant];
}

// Example usage:
// <Loading variant="default" size="md" text="Loading..." />
// <Loading variant="spinner" size="lg" text="Refreshing data..." />
// <Loading variant="pulse" size="sm" text="Please wait..." />
// <Loading variant="default" size="md" fullScreen text="Loading application..." /> 