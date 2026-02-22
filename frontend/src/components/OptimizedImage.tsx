import React from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    className?: string;
    fallbackSrc?: string;
}

export function OptimizedImage({
    src,
    alt,
    className,
    fallbackSrc = '/images/placeholder.jpg',
    ...props
}: OptimizedImageProps) {
    const [error, setError] = React.useState(false);
    const [loaded, setLoaded] = React.useState(false);

    return (
        <div className={cn("relative overflow-hidden bg-muted", className)}>
            <img
                src={error ? fallbackSrc : src}
                alt={alt}
                className={cn(
                    "h-full w-full object-cover transition-opacity duration-300",
                    loaded ? "opacity-100" : "opacity-0"
                )}
                loading="lazy"
                decoding="async"
                onLoad={() => setLoaded(true)}
                onError={() => setError(true)}
                {...props}
            />
            {!loaded && (
                <div className="absolute inset-0 animate-pulse bg-muted-foreground/10" />
            )}
        </div>
    );
}
