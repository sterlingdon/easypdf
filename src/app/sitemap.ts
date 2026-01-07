import { MetadataRoute } from 'next';

export const dynamic = 'force-static';


export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://pdf.master'; // Replace with actual domain

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/compress-pdf`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // Add other routes as they are migrated
  ];
}
