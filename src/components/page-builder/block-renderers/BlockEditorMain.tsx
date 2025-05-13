import React from 'react';
import {
  AppointmentCalendarBlock,
  SmartFeedbackBlock,
  FormBlock,
  HeadingTextBlock,
  LinksBlock,
  SocialLinksBlock,
  ButtonBlock,
  VideoBlock,
  ImagesBlock,
  ImagesLinksBlock,
  PDFGalleryBlock,
  OtherDetailsBlock,
  BusinessHoursBlock,
  TeamBlock,
  TestimonialsBlock,
  ProductsBlock,
  ImageTextBlock
} from './index';
import { BlockType, BlockStyles, BlockContent as BlockContentType } from '@/types/block';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

export interface BaseBlockContent {
  styles?: Record<string, any>;
}

export interface HeadingTextContent extends BaseBlockContent {
  heading: string;
  text: string;
}

export interface ImageContent extends BaseBlockContent {
  src: string;
  alt?: string;
}

export interface ImagesContent extends BaseBlockContent {
  images: Array<{
    src: string;
    alt?: string;
  }>;
  displayType: string;
}

export interface ImagesLinksContent extends BaseBlockContent {
  images: Array<{
    src: string;
    alt?: string;
    link?: string;
  }>;
  displayType: string;
}

export interface VideoContent extends BaseBlockContent {
  src: string;
  thumbnail?: string;
  provider: string;
}

export interface TestimonialsContent extends BaseBlockContent {
  testimonials: Array<{
    name: string;
    role?: string;
    text: string;
    image?: string;
  }>;
  displayType: string;
}

export interface SmartFeedbackContent extends BaseBlockContent {
  question: string;
  options: string[];
  allowComments: boolean;
}

export interface SocialLinksContent extends BaseBlockContent {
  links: Array<{
    platform: string;
    url: string;
  }>;
  displayType: string;
}

export interface LinksContent extends BaseBlockContent {
  links: Array<{
    text: string;
    url: string;
  }>;
  displayType: string;
}

export interface ButtonContent extends BaseBlockContent {
  text: string;
  url: string;
  style: string;
}

export interface FormContent extends BaseBlockContent {
  fields: Array<{
    type: string;
    label: string;
    required: boolean;
    placeholder?: string;
  }>;
  submitText: string;
  submitAction: string;
}

export interface TeamContent extends BaseBlockContent {
  members: Array<{
    name: string;
    role: string;
    image?: string;
    bio?: string;
  }>;
  displayType: string;
}

export interface ProductsContent extends BaseBlockContent {
  products: Array<{
    name: string;
    description?: string;
    price?: string;
    image?: string;
  }>;
  displayType: string;
}

export interface AppointmentCalendarContent extends BaseBlockContent {
  availableDays: string[];
  timeSlots: string[];
  contactRequired: boolean;
}

export interface BusinessHoursContent extends BaseBlockContent {
  hours: Array<{
    day: string;
    open: string;
    close: string;
    closed: boolean;
  }>;
}

export interface PDFGalleryContent extends BaseBlockContent {
  pdfs: Array<{
    title: string;
    url: string;
    thumbnail?: string;
  }>;
  displayType: string;
}

export interface OtherDetailsContent extends BaseBlockContent {
  sections: Array<{
    title: string;
    content: string;
  }>;
}

export interface ImageTextContent extends BaseBlockContent {
  image: {
    src: string;
    alt: string;
  };
  text: string;
  layout: string;
}

export type BlockContent = 
  | HeadingTextContent
  | ImageContent
  | ImagesContent
  | ImagesLinksContent
  | VideoContent
  | TestimonialsContent
  | SmartFeedbackContent
  | SocialLinksContent
  | LinksContent
  | ButtonContent
  | FormContent
  | TeamContent
  | ProductsContent
  | AppointmentCalendarContent
  | BusinessHoursContent
  | PDFGalleryContent
  | OtherDetailsContent
  | ImageTextContent
  | Record<string, any>;

interface BlockEditorMainProps {
  blockType: BlockType | string;
  content: BlockContentType;
  styles?: BlockStyles;
}

async function getDeviceAndLocation() {
  let device = 'unknown';
  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) device = 'mobile';
    else if (/tablet/i.test(ua)) device = 'tablet';
    else device = 'desktop';
  }
  let location = { city: '', country: '', region: '' };
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    location = { city: data.city, country: data.country_name, region: data.region };
  } catch {}
  return { device, location };
}

async function handleBlockClick({ blockType, blockLabel, linkUrl }) {
  const brandId = window.BRAND_ID;
  const landingPageId = window.LANDING_PAGE_ID;
  const customerEmail = localStorage.getItem('customer_email') || null;
  const { device, location } = await getDeviceAndLocation();
  await supabase.from('page_clicks').insert({
    brand_id: brandId,
    landing_page_id: landingPageId,
    block_type: blockType,
    block_label: blockLabel,
    link_url: linkUrl,
    customer_email: customerEmail,
    device,
    city: location.city,
    country: location.country,
    region: location.region
  });
}

export function BlockEditorMain({ blockType, content, styles = {} }: BlockEditorMainProps) {
  const applyContainerStyles = (additionalClasses?: string) => {
    const containerStyles = {
      backgroundColor: styles.backgroundColor || content.backgroundColor,
      color: styles.textColor || content.textColor,
      padding: styles.padding || content.padding,
      margin: styles.margin || content.margin,
      borderRadius: styles.borderRadius || content.borderRadius,
      borderWidth: styles.borderWidth || content.borderWidth,
      borderColor: styles.borderColor || content.borderColor,
      borderStyle: styles.borderStyle || content.borderStyle,
      boxShadow: styles.boxShadow || content.boxShadow,
      width: styles.width || content.width,
      height: styles.height || content.height,
      minHeight: styles.minHeight || content.minHeight,
      maxWidth: styles.maxWidth || content.maxWidth,
      fontSize: styles.fontSize || content.fontSize,
      fontWeight: styles.fontWeight || content.fontWeight,
      fontFamily: styles.fontFamily || content.fontFamily,
      lineHeight: styles.lineHeight || content.lineHeight,
      letterSpacing: styles.letterSpacing || content.letterSpacing,
      opacity: styles.opacity || content.opacity,
      transform: styles.transform || content.transform,
      transition: styles.transition || content.transition
    };

    return {
      className: cn(
        'block-container',
        additionalClasses,
        (styles.textAlign || content.textAlign) && `text-${styles.textAlign || content.textAlign}`,
        (styles.display || content.display) && `flex flex-${styles.flexDirection || content.flexDirection || 'col'}`,
        (styles.alignItems || content.alignItems) && `items-${styles.alignItems || content.alignItems}`,
        (styles.justifyContent || content.justifyContent) && `justify-${styles.justifyContent || content.justifyContent}`,
        (styles.gap || content.gap) && `gap-${styles.gap || content.gap}`
      ),
      style: containerStyles
    };
  };

  const applyTextStyles = (additionalClasses?: string) => {
    const textStyles = {
      color: styles.textColor || content.textColor,
      fontSize: styles.fontSize || content.fontSize,
      fontWeight: styles.fontWeight || content.fontWeight,
      fontFamily: styles.fontFamily || content.fontFamily,
      lineHeight: styles.lineHeight || content.lineHeight,
      letterSpacing: styles.letterSpacing || content.letterSpacing,
      textAlign: styles.textAlign || content.textAlign
    };

    return {
      className: cn('block-text', additionalClasses),
      style: textStyles
    };
  };

  const renderContent = () => {
    const blockTypeString = blockType.toString();
    
    switch (blockTypeString) {
      case BlockType.HEADING:
        return (
          <div {...applyContainerStyles()}>
            <h2 {...applyTextStyles('text-2xl font-bold')}>
              {content.title}
            </h2>
            {content.description && (
              <p {...applyTextStyles('text-muted-foreground mt-2')}>
                {content.description}
              </p>
            )}
          </div>
        );

      case BlockType.TEXT:
        return (
          <div {...applyContainerStyles()}>
            <div {...applyTextStyles()}>
              {content.text}
            </div>
          </div>
        );

      case BlockType.IMAGE:
        return (
          <div {...applyContainerStyles('space-y-4')}>
            {content.title && (
              <h2 {...applyTextStyles('text-2xl font-bold')}>
                {content.title}
              </h2>
            )}
            {content.description && (
              <p {...applyTextStyles('text-muted-foreground')}>
                {content.description}
              </p>
            )}
            {content.image?.url ? (
              <div className="relative rounded-lg overflow-hidden" style={{ aspectRatio: styles.aspectRatio || '16/9' }}>
                <img
                  src={content.image.url}
                  alt={content.image.alt || 'Image'}
                  className={cn(
                    'w-full h-full',
                    styles.objectFit && `object-${styles.objectFit}`
                  )}
                  onClick={() => handleBlockClick({ blockType: 'image', blockLabel: content.alt || content.title || '', linkUrl: undefined })}
                />
              </div>
            ) : (
              <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">No image selected</p>
              </div>
            )}
          </div>
        );

      case BlockType.IMAGE_TEXT:
        return (
          <div {...applyContainerStyles(cn(
            'gap-8',
            content.imagePosition === 'left' && 'flex-row',
            content.imagePosition === 'right' && 'flex-row-reverse',
            content.imagePosition === 'top' && 'flex-col',
            content.imagePosition === 'bottom' && 'flex-col-reverse'
          ))}>
            <div className="flex-1 space-y-4">
              {content.title && (
                <h2 {...applyTextStyles('text-2xl font-bold')}>
                  {content.title}
                </h2>
              )}
              {content.description && (
                <p {...applyTextStyles('text-muted-foreground')}>
                  {content.description}
                </p>
              )}
            </div>
            {content.image?.url ? (
              <div className="flex-1 relative rounded-lg overflow-hidden" style={{ aspectRatio: styles.aspectRatio || '16/9' }}>
                <img
                  src={content.image.url}
                  alt={content.image.alt || 'Image'}
                  className={cn(
                    'w-full h-full',
                    styles.objectFit && `object-${styles.objectFit}`
                  )}
                  onClick={() => handleBlockClick({ blockType: 'image', blockLabel: content.alt || content.title || '', linkUrl: undefined })}
                />
              </div>
            ) : (
              <div className="flex-1 aspect-video rounded-lg bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">No image selected</p>
              </div>
            )}
          </div>
        );

      case 'heading':
        if ('text' in content) {
          return (
            <h2 
              style={{
                fontSize: styles.fontSize || '32px',
                fontWeight: styles.fontWeight || 'bold',
                color: styles.textColor || '#000000',
                textAlign: styles.textAlign as any || 'left',
              }}
            >
              {content.text}
            </h2>
          );
        }
        return null;
      
      case 'text':
        if ('text' in content) {
          return (
            <div 
              style={{
                fontSize: styles.fontSize || '16px',
                color: styles.textColor || '#000000',
                textAlign: styles.textAlign as any || 'left',
              }}
            >
              {content.text}
            </div>
          );
        }
        return null;

      case 'heading + text':
        if ('heading' in content && 'text' in content) {
          return <HeadingTextBlock content={content as any} styles={styles} />;
        }
        return null;
        
      case 'image':
        if ('src' in content) {
          return (
            <div>
              {content.src ? (
                <img 
                  src={content.src} 
                  alt={content.alt || 'Image'} 
                  style={{
                    maxWidth: '100%',
                    borderRadius: styles.borderRadius || '4px',
                  }}
                  onClick={() => handleBlockClick({ blockType: 'image', blockLabel: content.alt || content.title || '', linkUrl: undefined })}
                />
              ) : (
                <div 
                  style={{
                    width: '100%',
                    height: '200px',
                    backgroundColor: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: styles.borderRadius || '4px',
                  }}
                >
                  <span className="text-muted-foreground">No image selected</span>
                </div>
              )}
            </div>
          );
        }
        return null;
      
      case 'images':
        if ('images' in content && 'displayType' in content) {
          return <ImagesBlock content={content as any} styles={styles} />;
        }
        return null;
      
      case 'images + links':
        if ('images' in content && 'displayType' in content) {
          return <ImagesLinksBlock content={content as any} styles={styles} />;
        }
        return null;
      
      case 'video':
        if ('src' in content && 'provider' in content) {
          return <VideoBlock content={content as any} styles={styles} />;
        }
        return null;
      
      case 'testimonials':
        if ('testimonials' in content && 'displayType' in content) {
          return <TestimonialsBlock content={content as any} styles={styles} />;
        }
        return null;

      case 'smart feedback':
        if ('question' in content && 'options' in content) {
          return <SmartFeedbackBlock content={content as any} styles={styles} />;
        }
        return null;

      case 'map':
        if ('location' in content) {
          return (
            <div>
              {content.location && (
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(content.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                  style={{
                    width: '100%',
                    height: '400px',
                    border: 'none',
                    borderRadius: styles.borderRadius || '4px',
                  }}
                  allowFullScreen
                  loading="lazy"
                  title="Map"
                />
              )}
            </div>
          );
        }
        return null;
      
      case 'social links':
        if ('links' in content && 'displayType' in content) {
          return <SocialLinksBlock content={content as any} styles={styles} />;
        }
        return null;

      case 'links':
        if ('links' in content && 'displayType' in content) {
          return <LinksBlock content={content as any} styles={styles} />;
        }
        return null;

      case 'button':
        if ('text' in content && 'url' in content) {
          return <ButtonBlock content={content as any} styles={styles} />;
        }
        return null;
      
      case 'form':
        if ('fields' in content && 'submitText' in content) {
          return <FormBlock content={content as any} styles={styles as any} />;
        }
        return null;
      
      case 'contact form':
        return (
          <FormBlock 
            content={{
              fields: [
                { type: 'text', label: 'Name', required: true, placeholder: 'Enter your name' },
                { type: 'email', label: 'Email', required: true, placeholder: 'Enter your email' },
                { type: 'textarea', label: 'Message', required: false, placeholder: 'Enter your message' }
              ],
              submitText: 'Send Message',
              submitAction: 'email'
            }}
            styles={styles as any}
            brandId={content.brandId || content.brand_id}
          />
        );
      
      case 'team':
        if ('members' in content && 'displayType' in content) {
          return <TeamBlock content={content as any} styles={styles} />;
        }
        return null;
      
      case 'products':
        if ('products' in content && 'displayType' in content) {
          return <ProductsBlock content={content as any} styles={styles} />;
        }
        return null;
      
      case 'appointment/calendar':
        if ('availableDays' in content && 'timeSlots' in content) {
          return <AppointmentCalendarBlock content={content as any} styles={styles} />;
        }
        return null;
      
      case 'business hours':
        if ('hours' in content) {
          return <BusinessHoursBlock content={content as any} styles={styles} />;
        }
        return null;
      
      case 'pdf gallery':
        if ('pdfs' in content && 'displayType' in content) {
          return <PDFGalleryBlock content={content as any} styles={styles} />;
        }
        return null;
      
      case 'other details':
        if ('sections' in content) {
          return <OtherDetailsBlock content={content as any} styles={styles} />;
        }
        return null;
      
      case 'image + text':
        if ('image' in content && 'text' in content) {
          return <ImageTextBlock content={content as any} styles={styles} />;
        }
        return null;
      
      case 'hero': {
        // Use dummy content if missing
        const logo = content.logo || 'https://placehold.co/64x64?text=Logo';
        const image = content.image || 'https://placehold.co/600x300?text=Hero+Image';
        const title = content.title || 'Welcome to Your Brand!';
        const subtitle = content.subtitle || 'Delicious food delivered to you.';
        const ctaText = content.ctaText || 'Order Now';
        const ctaLink = content.ctaLink || 'https://example.com/order';
        return (
          <div {...applyContainerStyles('flex flex-col items-center justify-center py-12')}> 
            <img src={logo} alt="Logo" className="mb-4 h-16 w-16 object-contain" />
            <h1 {...applyTextStyles('text-3xl md:text-5xl font-bold mb-2 text-center')}>{title}</h1>
            <p {...applyTextStyles('text-lg md:text-2xl text-muted-foreground mb-4 text-center')}>{subtitle}</p>
            <img src={image} alt="Hero" className="rounded-lg shadow-lg max-w-full h-auto mt-4" />
            <a href={ctaLink} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold shadow hover:bg-primary/90 transition">
              {ctaText}
            </a>
          </div>
        );
      }
      
      case 'products': {
        const products = (content.products && content.products.length > 0) ? content.products : [
          { name: 'Pizza Margherita', image: 'https://placehold.co/120x120?text=Pizza', price: '₹299', link: '#' },
          { name: 'Veg Burger', image: 'https://placehold.co/120x120?text=Burger', price: '₹149', link: '#' },
          { name: 'Pasta Alfredo', image: 'https://placehold.co/120x120?text=Pasta', price: '₹199', link: '#' }
        ];
        return (
          <div {...applyContainerStyles('grid grid-cols-1 md:grid-cols-3 gap-6')}> 
            {products.map((p, i) => (
              <div key={i} className="border rounded-lg p-4 flex flex-col items-center">
                <img src={p.image} alt={p.name} className="w-24 h-24 object-cover rounded mb-2" />
                <div className="font-bold text-lg mb-1">{p.name}</div>
                <div className="text-primary font-semibold mb-2">{p.price}</div>
                <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Order</a>
              </div>
            ))}
          </div>
        );
      }
      case 'testimonials': {
        const testimonials = (content.testimonials && content.testimonials.length > 0) ? content.testimonials : [
          { text: 'Amazing taste!', author: 'Ravi' },
          { text: 'Quick delivery!', author: 'Priya' }
        ];
        return (
          <div {...applyContainerStyles('grid grid-cols-1 md:grid-cols-2 gap-4')}> 
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gray-50 p-4 rounded shadow">
                <div className="italic mb-2">"{t.text}"</div>
                <div className="text-right font-semibold">- {t.author}</div>
              </div>
            ))}
          </div>
        );
      }
      case 'images': {
        const images = (content.images && content.images.length > 0) ? content.images : [
          { src: 'https://placehold.co/300x200?text=Image+1', alt: 'Image 1' },
          { src: 'https://placehold.co/300x200?text=Image+2', alt: 'Image 2' },
          { src: 'https://placehold.co/300x200?text=Image+3', alt: 'Image 3' }
        ];
        return (
          <div {...applyContainerStyles('grid grid-cols-1 md:grid-cols-3 gap-4')}> 
            {images.map((img, i) => (
              <img key={i} src={img.src} alt={img.alt} className="rounded shadow w-full h-auto" />
            ))}
          </div>
        );
      }
      case 'links': {
        const links = (content.links && content.links.length > 0) ? content.links : [
          { text: 'Swiggy', url: 'https://swiggy.com', icon: '' },
          { text: 'Zomato', url: 'https://zomato.com', icon: '' }
        ];
        return (
          <div {...applyContainerStyles('flex flex-col items-center gap-2')}> 
            {links.map((l, i) => (
              <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-lg">{l.text}</a>
            ))}
          </div>
        );
      }
      case 'social links': {
        const links = (content.links && content.links.length > 0) ? content.links : [
          { platform: 'twitter', url: 'https://twitter.com' },
          { platform: 'facebook', url: 'https://facebook.com' },
          { platform: 'instagram', url: 'https://instagram.com' }
        ];
        return (
          <div {...applyContainerStyles('flex gap-4 justify-center')}> 
            {links.map((l, i) => (
              <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-lg capitalize">{l.platform}</a>
            ))}
          </div>
        );
      }
      case 'team': {
        const members = (content.members && content.members.length > 0) ? content.members : [
          { name: 'Team Member 1', role: 'CEO', photo: 'https://placehold.co/80x80?text=TM1' },
          { name: 'Team Member 2', role: 'CTO', photo: 'https://placehold.co/80x80?text=TM2' }
        ];
        return (
          <div {...applyContainerStyles('flex gap-6 justify-center')}> 
            {members.map((m, i) => (
              <div key={i} className="flex flex-col items-center">
                <img src={m.photo} alt={m.name} className="w-20 h-20 rounded-full mb-2" />
                <div className="font-bold">{m.name}</div>
                <div className="text-sm text-muted-foreground">{m.role}</div>
              </div>
            ))}
          </div>
        );
      }
      case 'gallery': {
        const images = (content.images && content.images.length > 0) ? content.images : [
          { src: 'https://placehold.co/200x200?text=Gallery+1', alt: 'Gallery 1' },
          { src: 'https://placehold.co/200x200?text=Gallery+2', alt: 'Gallery 2' }
        ];
        return (
          <div {...applyContainerStyles('grid grid-cols-2 gap-4')}> 
            {images.map((img, i) => (
              <img key={i} src={img.src} alt={img.alt} className="rounded shadow w-full h-auto" />
            ))}
          </div>
        );
      }
      case 'button': {
        const text = content.text || 'Click Here';
        const url = content.url || 'https://example.com';
        return (
          <div {...applyContainerStyles('flex justify-center')}> 
            <a href={url} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-primary text-white rounded-lg font-semibold shadow hover:bg-primary/90 transition">
              {text}
            </a>
          </div>
        );
      }
      case 'map': {
        const location = content.location || 'New York, NY';
        return (
          <div {...applyContainerStyles('flex justify-center')}> 
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
              style={{ width: '100%', height: '300px', border: 'none', borderRadius: styles.borderRadius || '4px' }}
              allowFullScreen
              loading="lazy"
              title="Map"
            />
          </div>
        );
      }
      
      default:
        return <div>Unsupported block type: {blockType}</div>;
    }
  };

  return (
    <div className="rounded-lg">
      {renderContent()}
    </div>
  );
}
