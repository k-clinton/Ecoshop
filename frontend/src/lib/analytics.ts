import * as Sentry from '@sentry/react';

type AnalyticsEvent = 'view_product' | 'add_to_cart' | 'remove_from_cart' | 'initiate_checkout' | 'complete_purchase' | 'search';

interface EventProperties {
    [key: string]: any;
}

export const analytics = {
    track(event: AnalyticsEvent, properties?: EventProperties) {
        // Log to console in development
        if (import.meta.env.DEV) {
            console.log(`[Analytics] ${event}`, properties);
        }

        // Record as Sentry breadcrumb for better error context
        Sentry.addBreadcrumb({
            category: 'analytics',
            message: event,
            data: properties,
            level: 'info',
        });

        // In a real app, we would send this to Google Analytics, Mixpanel, etc.
        // Example: window.gtag('event', event, properties);
    },

    identify(userId: string, traits?: EventProperties) {
        if (import.meta.env.DEV) {
            console.log(`[Analytics] Identify ${userId}`, traits);
        }

        Sentry.setUser({ id: userId, ...traits });
    }
};
