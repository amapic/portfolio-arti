import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/', // Pages d'administration à exclure
    },
    sitemap: 'https://www.amaurypichat.fr/sitemap.xml',
  }
} 