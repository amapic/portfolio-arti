'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SeoData {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  twitterCard: string;
  siteUrl: string;
  robotsTxt: {
    allow: string[];
    disallow: string[];
  };
  sitemapUrls: Array<{
    url: string;
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: number;
  }>;
  schema: {
    name: string;
    jobTitle: string;
    description: string;
    socialLinks: string[];
    expertise: string[];
  };
}

export default function SeoAdminPage() {
  const [seoData, setSeoData] = useState<SeoData>({
    title: '',
    description: '',
    keywords: [],
    ogImage: '',
    twitterCard: '',
    siteUrl: '',
    robotsTxt: {
      allow: ['/'],
      disallow: ['/admin'],
    },
    sitemapUrls: [],
    schema: {
      name: '',
      jobTitle: '',
      description: '',
      socialLinks: [],
      expertise: [],
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchSeoData();
  }, []);

  const fetchSeoData = async () => {
    try {
      const response = await fetch('/api/seo');
      if (!response.ok) throw new Error('Failed to fetch SEO data');
      const data = await response.json();
      setSeoData(data);
    } catch (error) {
      console.error('Error fetching SEO data:', error);
      setMessage('Error loading SEO data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(seoData),
      });

      if (!response.ok) throw new Error('Failed to save SEO data');
      
      setMessage('SEO data saved successfully!');
      router.refresh();
    } catch (error) {
      console.error('Error saving SEO data:', error);
      setMessage('Error saving SEO data');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">SEO Administration</h1>
      
      {message && (
        <div className={`p-4 mb-6 rounded-lg ${
          message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Métadonnées de base */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Basic Metadata</h2>
          
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={seoData.title}
              onChange={(e) => setSeoData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={seoData.description}
              onChange={(e) => setSeoData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-2 border rounded-lg"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Keywords (comma-separated)</label>
            <input
              type="text"
              value={seoData.keywords.join(', ')}
              onChange={(e) => setSeoData(prev => ({
                ...prev,
                keywords: e.target.value.split(',').map(k => k.trim())
              }))}
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </section>

        {/* Open Graph */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Open Graph</h2>
          
          <div>
            <label className="block text-sm font-medium mb-1">OG Image URL</label>
            <input
              type="text"
              value={seoData.ogImage}
              onChange={(e) => setSeoData(prev => ({ ...prev, ogImage: e.target.value }))}
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </section>

        {/* Schema.org */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Schema.org Data</h2>
          
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={seoData.schema.name}
              onChange={(e) => setSeoData(prev => ({
                ...prev,
                schema: { ...prev.schema, name: e.target.value }
              }))}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Job Title</label>
            <input
              type="text"
              value={seoData.schema.jobTitle}
              onChange={(e) => setSeoData(prev => ({
                ...prev,
                schema: { ...prev.schema, jobTitle: e.target.value }
              }))}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Expertise (one per line)</label>
            <textarea
              value={seoData.schema.expertise.join('\n')}
              onChange={(e) => setSeoData(prev => ({
                ...prev,
                schema: {
                  ...prev.schema,
                  expertise: e.target.value.split('\n').map(e => e.trim())
                }
              }))}
              className="w-full p-2 border rounded-lg"
              rows={4}
            />
          </div>
        </section>

        {/* Sitemap URLs */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Sitemap URLs</h2>
          
          {seoData.sitemapUrls.map((urlData, index) => (
            <div key={index} className="flex gap-4">
              <input
                type="text"
                value={urlData.url}
                onChange={(e) => {
                  const newUrls = [...seoData.sitemapUrls];
                  newUrls[index] = { ...urlData, url: e.target.value };
                  setSeoData(prev => ({ ...prev, sitemapUrls: newUrls }));
                }}
                className="flex-grow p-2 border rounded-lg"
                placeholder="URL"
              />
              <select
                value={urlData.changeFrequency}
                onChange={(e) => {
                  const newUrls = [...seoData.sitemapUrls];
                  newUrls[index] = { ...urlData, changeFrequency: e.target.value as any };
                  setSeoData(prev => ({ ...prev, sitemapUrls: newUrls }));
                }}
                className="p-2 border rounded-lg"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <input
                type="number"
                value={urlData.priority}
                onChange={(e) => {
                  const newUrls = [...seoData.sitemapUrls];
                  newUrls[index] = { ...urlData, priority: Number(e.target.value) };
                  setSeoData(prev => ({ ...prev, sitemapUrls: newUrls }));
                }}
                className="w-24 p-2 border rounded-lg"
                step="0.1"
                min="0"
                max="1"
              />
              <button
                type="button"
                onClick={() => {
                  setSeoData(prev => ({
                    ...prev,
                    sitemapUrls: prev.sitemapUrls.filter((_, i) => i !== index)
                  }));
                }}
                className="p-2 text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={() => {
              setSeoData(prev => ({
                ...prev,
                sitemapUrls: [
                  ...prev.sitemapUrls,
                  { url: '', changeFrequency: 'monthly', priority: 0.5 }
                ]
              }));
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Add URL
          </button>
        </section>

        <div className="pt-6">
          <button
            type="submit"
            disabled={isSaving}
            className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
              ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSaving ? 'Saving...' : 'Save SEO Settings'}
          </button>
        </div>
      </form>
    </div>
  );
} 