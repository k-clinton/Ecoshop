import { Helmet } from 'react-helmet-async';
import { useSettings } from '../store/SettingsContext';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    article?: boolean;
}

export function SEO({ title, description, image, article }: SEOProps) {
    const { settings } = useSettings();

    const siteName = settings?.site_name || 'EcoShop';
    const defaultDescription = settings?.site_description || 'Sustainable and eco-friendly products for a better planet.';

    const seo = {
        title: title ? `${title} | ${siteName}` : siteName,
        description: description || defaultDescription,
        image: image || '/og-image.jpg',
        type: article ? 'article' : 'website',
    };

    return (
        <Helmet>
            <title>{seo.title}</title>
            <meta name="description" content={seo.description} />
            <meta name="image" content={seo.image} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={seo.type} />
            <meta property="og:title" content={seo.title} />
            <meta property="og:description" content={seo.description} />
            <meta property="og:image" content={seo.image} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={seo.title} />
            <meta name="twitter:description" content={seo.description} />
            <meta name="twitter:image" content={seo.image} />
        </Helmet>
    );
}
