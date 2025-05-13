import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageEditorSidebar } from "./PageEditorSidebar";
import { PageEditorCanvas } from "./PageEditorCanvas";
import { PageEditorPreview } from "./PageEditorPreview";
import { PageSettingsDialog } from "./PageSettingsDialog";
import { MediaLibrary } from "./MediaLibrary";
import { SaveIcon, Share2, Smartphone, Settings } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageBuilderProps } from "./interfaces";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export interface Block {
  id: string;
  type: string;
  content: Record<string, any>;
  styles: Record<string, any>;
}

export interface LandingPage {
  id?: string;
  title: string;
  slug?: string;
  backgroundColor: string;
  fontFamily: string;
  published: boolean;
}

export function PageBuilder({ userId, pageId }: PageBuilderProps) {
  const [pageData, setPageData] = useState<LandingPage>({
    title: "Untitled Landing Page",
    backgroundColor: "#FFFFFF",
    fontFamily: "Inter, sans-serif",
    published: false,
  });
  
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(pageId ? true : false);
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [activeImageSelector, setActiveImageSelector] = useState<{
    blockId: string;
    fieldPath: string;
    altPath?: string;
  } | null>(null);
  const [brandId, setBrandId] = useState<string | null>(null);
  
  const navigate = useNavigate();
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    const loadPageData = async () => {
      if (!pageId) return;
      
      try {
        setIsLoading(true);
        
        const { data: pageData, error: pageError } = await supabase
          .from('landing_pages')
          .select('*')
          .eq('id', pageId)
          .single();
        
        if (pageError) {
          toast.error("Failed to load page data");
          console.error(pageError);
          return;
        }
        
        if (pageData) {
          setPageData({
            id: pageData.id,
            title: pageData.title,
            slug: pageData.slug,
            backgroundColor: pageData.background_color || "#FFFFFF",
            fontFamily: pageData.font_family || "Inter, sans-serif",
            published: pageData.published || false
          });
          
          setCurrentPageId(pageData.id);
          
          const { data: components, error: componentsError } = await supabase
            .from('page_components')
            .select('*')
            .eq('page_id', pageId)
            .order('position', { ascending: true });
          
          if (componentsError) {
            toast.error("Failed to load page components");
            console.error(componentsError);
            return;
          }
          
          if (components && components.length > 0) {
            const loadedBlocks = components.map(component => ({
              id: `block-${component.id}`,
              type: component.type,
              content: component.content || {},
              styles: component.styles || getDefaultStylesForBlockType(component.type)
            }));
            
            setBlocks(loadedBlocks);
          }
        }
      } catch (error) {
        console.error("Error loading page:", error);
        toast.error("Failed to load page");
      } finally {
        setIsLoading(false);
      }
    };

    loadPageData();
  }, [pageId]);

  useEffect(() => {
    async function fetchBrandId() {
      if (!userId) return;
      const { data: brand } = await supabase
        .from('brands')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      if (brand && brand.id) setBrandId(brand.id);
    }
    fetchBrandId();
  }, [userId]);

  const handleAddBlock = (blockType: string, content?: any) => {
    const newBlock = {
      id: `block-${Date.now()}-${Math.random()}`,
      type: blockType,
      content: content || getDefaultContentForBlockType(blockType),
      styles: getDefaultStylesForBlockType(blockType),
    };
    setBlocks(prevBlocks => [...prevBlocks, newBlock]);
  };
  
  const handleDeleteBlock = (blockId: string) => {
    setBlocks(blocks.filter(block => block.id !== blockId));
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setBlocks((blocks) => {
        const oldIndex = blocks.findIndex((block) => block.id === active.id);
        const newIndex = blocks.findIndex((block) => block.id === over.id);
        
        return arrayMove(blocks, oldIndex, newIndex);
      });
    }
  };
  
  const handleUpdateBlock = (blockId: string, updatedContent: Record<string, any>, updatedStyles: Record<string, any>) => {
    setBlocks(blocks.map(block => 
      block.id === blockId 
        ? { 
            ...block, 
            content: updatedContent,
            styles: updatedStyles || block.styles || {}
          } 
        : block
    ));
  };
  
  const handlePageSettingsChange = (updatedSettings: Partial<LandingPage>) => {
    setPageData({ ...pageData, ...updatedSettings });
  };

  const openMediaLibrary = (blockId: string, fieldPath: string, altPath?: string) => {
    setActiveImageSelector({
      blockId,
      fieldPath,
      altPath
    });
    setShowMediaLibrary(true);
  };

  const handleImageSelected = (url: string, alt: string) => {
    if (!activeImageSelector) return;
    
    const { blockId, fieldPath, altPath } = activeImageSelector;
    const block = blocks.find(b => b.id === blockId);
    
    if (!block) return;
    
    const updatedContent = JSON.parse(JSON.stringify(block.content));
    
    setNestedValue(updatedContent, fieldPath.split('.'), url);
    
    if (altPath) {
      setNestedValue(updatedContent, altPath.split('.'), alt);
    }
    
    handleUpdateBlock(blockId, updatedContent, block.styles || {});
  };
  
  const setNestedValue = (obj: any, path: string[], value: any) => {
    const lastKey = path.pop();
    const lastObj = path.reduce((obj, key) => {
      if (obj[key] === undefined) {
        obj[key] = {};
      }
      return obj[key];
    }, obj);
    
    if (lastKey !== undefined) {
      lastObj[lastKey] = value;
    }
  };

  const savePage = async () => {
    try {
      setIsSaving(true);
      
      if (!userId) {
        toast.error("You need to be logged in to save a page");
        navigate("/auth");
        return;
      }
      
      let landingPageId = currentPageId;
      
      if (!landingPageId) {
        const tempSlug = `${pageData.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
        
        // Fetch brand for this user
        const { data: brand } = await supabase
          .from('brands')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        const { data: newPageData, error: pageError } = await supabase
          .from('landing_pages')
          .insert({
            title: pageData.title,
            background_color: pageData.backgroundColor,
            font_family: pageData.fontFamily,
            user_id: userId,
            slug: tempSlug,
            brand_id: brand?.id
          })
          .select('id, slug, brand_id')
          .single();
        
        if (pageError) {
          throw pageError;
        }
        
        landingPageId = newPageData.id;
        setCurrentPageId(landingPageId);
        toast.success(`Page created with slug: ${newPageData.slug}`);
      } else {
        const { error: updateError } = await supabase
          .from('landing_pages')
          .update({
            title: pageData.title,
            background_color: pageData.backgroundColor,
            font_family: pageData.fontFamily,
          })
          .eq('id', landingPageId);
          
        if (updateError) {
          throw updateError;
        }
      }
      
      if (landingPageId) {
        await supabase
          .from('page_components')
          .delete()
          .eq('page_id', landingPageId);
      }
      
      const componentsToInsert = blocks.map((block, index) => ({
        page_id: landingPageId,
        type: block.type,
        content: block.content,
        position: index,
        styles: block.styles,
      }));
      
      const { error: componentsError } = await supabase
        .from('page_components')
        .insert(componentsToInsert);
          
      if (componentsError) {
        throw componentsError;
      }
      
      toast.success("Landing page saved successfully!");
    } catch (error) {
      console.error("Error saving landing page:", error);
      toast.error("Failed to save landing page");
    } finally {
      setIsSaving(false);
    }
  };
  
  const getDefaultContentForBlockType = (blockType: string): Record<string, any> => {
    switch (blockType) {
      case 'heading':
        return { text: "Add Your Heading Here" };
      case 'text':
        return { text: "Add your text content here. This can be a paragraph explaining your product, service, or any information you want to share with your audience." };
      case 'heading + text':
        return { 
          heading: "Add Your Heading Here",
          text: "Add your text content here. This can be a paragraph explaining your product, service, or any information you want to share with your audience."
        };
      case 'image':
        return { src: "", alt: "Image description" };
      case 'images':
        return { 
          images: [
            { src: "", alt: "Image 1" },
            { src: "", alt: "Image 2" },
            { src: "", alt: "Image 3" }
          ],
          displayType: "grid"
        };
      case 'images + links':
        return { 
          images: [
            { src: "", alt: "Image 1", link: "", title: "Link 1" },
            { src: "", alt: "Image 2", link: "", title: "Link 2" },
            { src: "", alt: "Image 3", link: "", title: "Link 3" }
          ],
          displayType: "grid"
        };
      case 'video':
        return { src: "", thumbnail: "", provider: "youtube" };
      case 'testimonials':
        return { 
          testimonials: [
            { text: "This product is amazing!", author: "John Doe" },
            { text: "I love using this service!", author: "Jane Smith" }
          ],
          displayType: "cards"
        };
      case 'smart feedback':
        return { 
          question: "How would you rate our service?",
          options: ["Very satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very dissatisfied"],
          allowComments: true
        };
      case 'map':
        return { location: "New York, NY" };
      case 'social links':
        return { 
          links: [
            { platform: "twitter", url: "" },
            { platform: "facebook", url: "" },
            { platform: "instagram", url: "" }
          ],
          displayType: "icons"
        };
      case 'links':
        return {
          links: [
            { text: "Link 1", url: "", icon: "" },
            { text: "Link 2", url: "", icon: "" },
            { text: "Link 3", url: "", icon: "" }
          ],
          displayType: "buttons"
        };
      case 'button':
        return { text: "Click Here", url: "", style: "filled" };
      case 'form':
        return { 
          fields: [
            { type: "text", label: "Name", required: true, placeholder: "Enter your name" },
            { type: "email", label: "Email", required: true, placeholder: "Enter your email" },
            { type: "textarea", label: "Message", required: false, placeholder: "Enter your message" }
          ],
          submitText: "Submit",
          submitAction: "email"
        };
      case 'contact form':
        return { 
          fields: ["name", "email", "message"],
          submitText: "Submit"
        };
      case 'team':
        return { 
          members: [
            { name: "Team Member 1", role: "CEO", photo: "" },
            { name: "Team Member 2", role: "CTO", photo: "" },
            { name: "Team Member 3", role: "Designer", photo: "" }
          ],
          displayType: "cards"
        };
      case 'products':
        return {
          products: [
            { name: "Product 1", description: "Product description", image: "", price: "99.99", link: "" },
            { name: "Product 2", description: "Product description", image: "", price: "149.99", link: "" },
            { name: "Product 3", description: "Product description", image: "", price: "199.99", link: "" }
          ],
          displayType: "grid"
        };
      case 'appointment/calendar':
        return {
          availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          timeSlots: ["9:00", "10:00", "11:00", "13:00", "14:00", "15:00"],
          contactRequired: true
        };
      case 'business hours':
        return {
          hours: [
            { day: "Monday", open: "9:00 AM", close: "5:00 PM", closed: false },
            { day: "Tuesday", open: "9:00 AM", close: "5:00 PM", closed: false },
            { day: "Wednesday", open: "9:00 AM", close: "5:00 PM", closed: false },
            { day: "Thursday", open: "9:00 AM", close: "5:00 PM", closed: false },
            { day: "Friday", open: "9:00 AM", close: "5:00 PM", closed: false },
            { day: "Saturday", open: "10:00 AM", close: "2:00 PM", closed: false },
            { day: "Sunday", open: "", close: "", closed: true }
          ]
        };
      case 'pdf gallery':
        return {
          pdfs: [
            { title: "Document 1", file: "", thumbnail: "" },
            { title: "Document 2", file: "", thumbnail: "" },
            { title: "Document 3", file: "", thumbnail: "" }
          ],
          displayType: "grid"
        };
      case 'other details':
        return {
          sections: [
            { title: "Address", content: "123 Street Name, City, Country" },
            { title: "Phone", content: "+1 234 567 890" },
            { title: "Email", content: "contact@example.com" }
          ]
        };
      case 'image + text':
        return {
          image: { src: "", alt: "Image description" },
          text: "Add your text content here.",
          layout: "image-left"
        };
      default:
        return {};
    }
  };
  
  const getDefaultStylesForBlockType = (blockType: string): Record<string, any> => {
    const baseStyles = {
      backgroundColor: "transparent",
      textColor: "#000000",
      padding: "16px",
      borderRadius: "4px",
      textAlign: "left" as "left" | "center" | "right"
    };
    
    switch (blockType) {
      case 'heading':
        return { ...baseStyles, fontSize: "32px", fontWeight: "bold" };
      case 'text':
        return { ...baseStyles, fontSize: "16px" };
      case 'heading + text':
        return { ...baseStyles, headingSize: "24px", textSize: "16px" };
      case 'button':
        return { 
          ...baseStyles, 
          backgroundColor: "#3B82F6", 
          textColor: "#FFFFFF",
          borderRadius: "8px",
          textAlign: "center",
          padding: "12px 24px",
          hoverColor: "#2563EB"
        };
      case 'images':
      case 'images + links':
        return {
          ...baseStyles,
          gap: "16px",
          aspectRatio: "1/1",
          borderRadius: "8px",
          shadow: "none"
        };
      case 'testimonials':
      case 'team':
      case 'products':
        return {
          ...baseStyles,
          cardBgColor: "#FFFFFF",
          cardBorderRadius: "8px",
          cardPadding: "16px",
          cardShadow: "sm",
          gap: "16px"
        };
      case 'form':
      case 'contact form':
        return {
          ...baseStyles,
          fieldBgColor: "#FFFFFF",
          fieldBorderRadius: "4px",
          fieldBorderColor: "#E2E8F0",
          buttonColor: "#3B82F6",
          buttonTextColor: "#FFFFFF"
        };
      case 'social links':
      case 'links':
        return {
          ...baseStyles,
          iconSize: "24px",
          iconColor: "#3B82F6",
          hoverColor: "#2563EB",
          gap: "16px"
        };
      case 'image + text':
        return {
          ...baseStyles,
          gap: "24px",
          imageWidth: "50%",
          textWidth: "50%"
        };
      default:
        return baseStyles;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b py-3 px-6 flex items-center justify-between bg-white">
        <div className="flex items-center">
          <Input
            value={pageData.title}
            onChange={(e) => setPageData({...pageData, title: e.target.value})}
            className="border-none text-lg font-semibold focus-visible:ring-0 focus-visible:ring-offset-0 w-auto"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowSettings(true)}
            title="Page Settings"
          >
            <Settings size={18} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowMobilePreview(!showMobilePreview)}
            title="Toggle Mobile Preview"
          >
            <Smartphone size={18} />
          </Button>
          <Button variant="outline" disabled={!currentPageId}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button onClick={savePage} disabled={isSaving}>
            <SaveIcon className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <PageEditorSidebar onAddBlock={handleAddBlock} />
        
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 overflow-hidden flex">
            <div className={`flex-1 ${showMobilePreview ? 'w-1/2' : 'w-full'} h-full overflow-hidden`}>
              <SortableContext
                items={blocks.map(block => block.id)}
                strategy={verticalListSortingStrategy}
              >
                <PageEditorCanvas 
                  blocks={blocks} 
                  onDeleteBlock={handleDeleteBlock}
                  onUpdateBlock={handleUpdateBlock}
                  openMediaLibrary={openMediaLibrary}
                  pageStyles={{
                    backgroundColor: pageData.backgroundColor,
                    fontFamily: pageData.fontFamily
                  }}
                  brandId={brandId || ''}
                />
              </SortableContext>
            </div>
            
            {showMobilePreview && (
              <div className="w-1/2 border-l bg-gray-50">
                <PageEditorPreview 
                  blocks={blocks} 
                  pageStyles={{
                    backgroundColor: pageData.backgroundColor,
                    fontFamily: pageData.fontFamily
                  }}
                />
              </div>
            )}
          </div>
        </DndContext>
      </div>
      
      <PageSettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
        pageData={pageData}
        onUpdate={handlePageSettingsChange}
      />

      <MediaLibrary 
        open={showMediaLibrary}
        onOpenChange={setShowMediaLibrary}
        onSelectImage={handleImageSelected}
      />
    </div>
  );
}
