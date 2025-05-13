import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface ButtonBlockProps {
  content: {
    text: string;
    url: string;
    style: string;
  };
  styles: Record<string, any>;
}

export const ButtonBlock = ({ content, styles }: ButtonBlockProps) => {
  const getButtonVariant = () => {
    switch (content.style) {
      case 'outline':
        return 'outline';
      case 'ghost':
        return 'ghost';
      case 'link':
        return 'link';
      case 'filled':
      default:
        return 'default';
    }
  };

  // Click analytics handler
  const handleClick = async () => {
    try {
      // Use window.BRAND_ID and window.LANDING_PAGE_ID set by PublishedLandingPage
      const brandId = window.BRAND_ID;
      const landingPageId = window.LANDING_PAGE_ID;
      // Try to get customer email from localStorage (set after form submission)
      const customerEmail = localStorage.getItem('customer_email') || null;
      await supabase.from('page_clicks').insert({
        brand_id: brandId,
        landing_page_id: landingPageId,
        button_text: content.text,
        link_url: content.url,
        customer_email: customerEmail
      });
    } catch (err) {
      // Fail silently
    }
  };

  return (
    <div 
      className="button-block w-full my-4"
      style={{
        backgroundColor: styles.backgroundColor || 'transparent',
        padding: styles.padding || '16px',
        borderRadius: styles.borderRadius || '8px',
        textAlign: styles.textAlign || 'left'
      }}
    >
      <Button 
        variant={getButtonVariant()}
        asChild
        className="transition-colors"
        style={{
          backgroundColor: getButtonVariant() === 'default' ? (styles.backgroundColor || '#3B82F6') : undefined,
          color: styles.textColor || '#FFFFFF',
          borderRadius: styles.borderRadius || '8px',
          padding: styles.padding || '12px 24px',
        }}
      >
        <a 
          href={content.url} 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={handleClick}
        >
          {content.text}
        </a>
      </Button>
    </div>
  );
};
