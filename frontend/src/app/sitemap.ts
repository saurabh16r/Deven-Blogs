import { MetadataRoute } from 'next';
import { staticBlogs } from '@/utils/mockData';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://deven.io';

  // Core static pages
  const staticPaths = [
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/blogs`, lastModified: new Date() },
    { url: `${baseUrl}/pricing`, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
  ];

  // Dynamic blog post pages
  const blogPaths = staticBlogs.map((blog) => ({
    url: `${baseUrl}/blogs/${blog.slug}`,
    lastModified: new Date(blog.createdAt),
  }));

  return [...staticPaths, ...blogPaths];
}
