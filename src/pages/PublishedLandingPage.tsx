import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Block, BlockType } from '@/types/block';
import { BlockEditorMain } from '@/components/page-builder/block-renderers/BlockEditorMain';
import { toast } from "sonner";

declare global {
  interface Window {
    BRAND_ID?: string;
    LANDING_PAGE_ID?: string;
  }
}

interface LandingPageData {
  id: string;
  title: string;
  slug: string;
  background_color: string;
  font_family: string;
  published: boolean;
  brand_id?: string;
  brandId?: string;
}

const PublishedLandingPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [pageData, setPageData] = useState<LandingPageData | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const analyticsRecorded = useRef(false);
  const [searchParams] = typeof window !== 'undefined' ? [new URLSearchParams(window.location.search)] : [null];
  const qrId = searchParams?.get('qr_id');

  useEffect(() => {
    const fetchPageContent = async () => {
      console.log('Fetching page with slug:', slug);
      setIsLoading(true);
      setError(null);

      try {
        // First, get the landing page by slug
        const { data: pageData, error: pageError } = await supabase
          .from('landing_pages')
          .select('*')
          .eq('slug', slug)
          .single();

        if (pageError) {
          console.error('Error fetching landing page:', pageError);
          setError(`Page not found: ${slug}`);
          setIsLoading(false);
          return;
        }

        if (!pageData) {
          console.error('No page found with slug:', slug);
          setError(`Page not found: ${slug}`);
          setIsLoading(false);
          return;
        }

        console.log('Found landing page:', pageData);
        setPageData(pageData);

        // Expose brand_id and landing_page_id on window for analytics tracking
        window.BRAND_ID = pageData.brand_id || pageData.brandId;
        window.LANDING_PAGE_ID = pageData.id;

        // --- Analytics: Record page view and QR scan only once per load ---
        if (!analyticsRecorded.current && pageData.id && (pageData.brand_id || pageData.brandId)) {
          analyticsRecorded.current = true;
          await supabase.from('page_views').insert({
            brand_id: pageData.brand_id || pageData.brandId,
            landing_page_id: pageData.id
          });
          // Check for qr_id param
          if (qrId) {
            await supabase.from('qr_scans').insert({
              brand_id: pageData.brand_id || pageData.brandId,
              landing_page_id: pageData.id,
              qr_code_id: qrId
            });
          }
        }

        // Then get all components for this page
        const { data: components, error: componentsError } = await supabase
          .from('page_components')
          .select('*')
          .eq('page_id', pageData.id)
          .order('position', { ascending: true });

        if (componentsError) {
          console.error('Error fetching page components:', componentsError);
          toast.error("Failed to load page components");
          setError("Failed to load page content");
          setIsLoading(false);
          return;
        }

        console.log('Found components:', components);
        
        if (components && components.length > 0) {
          const loadedBlocks = components.map(component => ({
            id: `block-${component.id}`,
            type: component.type as BlockType | string,
            content: component.content || {},
            styles: component.styles || {}
          }));
          
          console.log('Mapped blocks:', loadedBlocks);
          setBlocks(loadedBlocks);
        } else {
          console.log('No components found for this page');
        }

      } catch (err) {
        console.error('Unexpected error:', err);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      console.log('Starting fetch for slug:', slug);
      fetchPageContent();
    } else {
      console.error('No slug provided in URL');
      setError("Invalid page URL");
      setIsLoading(false);
    }
  }, [slug, qrId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <a href="/" className="text-primary hover:underline">
          Go to Homepage
        </a>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundColor: pageData?.background_color || '#FFFFFF',
        fontFamily: pageData?.font_family || 'Inter, sans-serif'
      }}
    >
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {blocks.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700">This page has no content</h2>
          </div>
        ) : (
          <div className="space-y-6">
            {blocks.map((block) => (
              <div key={block.id} className="bg-white rounded-lg shadow p-4">
                <BlockEditorMain
                  blockType={block.type as BlockType | string}
                  content={
                    block.type === 'contact form'
                      ? { ...block.content, brandId: pageData?.brand_id || pageData?.brandId }
                      : block.content
                  }
                  styles={block.styles}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublishedLandingPage;
