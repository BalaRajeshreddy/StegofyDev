import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Block } from "./PageBuilder";
import { BlockStyles } from "@/types/block";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Switch } from "@/components/ui/switch";
import { FileSelector } from '@/components/FileSelector';
import { FileAsset } from '@/types/file';
import { ColorPicker } from '@/components/ColorPicker';

interface EditorBlock {
  id: string;
  type: string;
  content: Record<string, any>;
  brandId: string;
  styles?: Record<string, any>;
}

interface BlockEditorProps {
  block: EditorBlock;
  onUpdateBlock: (block: EditorBlock) => void;
  openMediaLibrary?: () => void;
  brandId: string;
}

export function BlockEditor({ block, onUpdateBlock, openMediaLibrary, brandId }: BlockEditorProps) {
  const [content, setContent] = useState<Record<string, any>>(block.content);
  const [styles, setStyles] = useState<Record<string, any>>(block.styles || {});
  const [isOpen, setIsOpen] = useState(true);

  const updateContent = (field: string, value: any) => {
    const newContent = { ...content, [field]: value };
    setContent(newContent);
  };
  
  const updateNestedContent = (path: string[], value: any) => {
    if (path.length === 0) return;
    
    setContent((prev) => {
      const result = { ...prev };
      let current = result;
      
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = {};
        }
        current = current[path[i]];
      }
      
      current[path[path.length - 1]] = value;
      return result;
    });
  };
  
  const handleSave = () => {
    const updatedBlock = {
      ...block,
      content,
      styles
    };
    onUpdateBlock(updatedBlock);
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleSave();
    }
  };
  
  const handleStyleChange = (field: string, value: any) => {
    setStyles(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderContentEditor = () => {
    switch (block.type) {
      case 'heading':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="heading-text">Heading Text</Label>
              <Input
                id="heading-text"
                value={content.text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
              />
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="text-content">Text Content</Label>
              <Textarea
                id="text-content"
                value={content.text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
                rows={5}
              />
            </div>
          </div>
        );
        
      case 'heading + text':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="combined-heading">Heading</Label>
              <Input
                id="combined-heading"
                value={content.heading || ''}
                onChange={(e) => updateContent('heading', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="combined-text">Text Content</Label>
              <Textarea
                id="combined-text"
                value={content.text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
                rows={4}
              />
            </div>
          </div>
        );
      
      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <Label>Image</Label>
              <FileSelector
                type="image"
                onSelect={(file) => {
                  if (file && 'url' in file) {
                    updateContent('src', (file as FileAsset).url);
                  }
                }}
                brandId={brandId}
                value={content.src}
              />
            </div>
            <div>
              <Label htmlFor="image-alt">Alt Text</Label>
              <Input
                id="image-alt"
                placeholder="Image description"
                value={content.alt || ''}
                onChange={(e) => updateContent('alt', e.target.value)}
              />
            </div>
          </div>
        );
        
      case 'images':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <Label>Display Type</Label>
              <Select
                value={content.displayType || 'grid'}
                onValueChange={(value) => updateContent('displayType', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select display type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                  <SelectItem value="slider">Slider</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(content.images || [{ src: "", alt: "" }, { src: "", alt: "" }, { src: "", alt: "" }]).map((image: any, index: number) => (
              <div key={index.toString()} className="space-y-2 border p-3 rounded-md">
                <Label>Image #{index + 1}</Label>
                <div>
                  <Label htmlFor={`image-src-${index.toString()}`} className="text-sm">Image URL</Label>
                  <Input
                    id={`image-src-${index.toString()}`}
                    value={image.src || ''}
                    onChange={(e) => updateNestedContent(['images', index.toString(), 'src'], e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor={`image-alt-${index.toString()}`} className="text-sm">Alt Text</Label>
                  <Input
                    id={`image-alt-${index.toString()}`}
                    value={image.alt || ''}
                    onChange={(e) => updateNestedContent(['images', index.toString(), 'alt'], e.target.value)}
                    placeholder="Image description"
                  />
                </div>
              </div>
            ))}
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => {
                const images = [...(content.images || [])];
                images.push({ src: "", alt: "" });
                updateContent('images', images);
              }}
            >
              Add Image
            </Button>
          </div>
        );
        
      case 'images + links':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <Label>Display Type</Label>
              <Select
                value={content.displayType || 'grid'}
                onValueChange={(value) => updateContent('displayType', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select display type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                  <SelectItem value="slider">Slider</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(content.images || [{ src: "", alt: "", link: "", title: "" }]).map((image: any, index: number) => (
              <div key={index.toString()} className="space-y-2 border p-3 rounded-md">
                <Label>Image with Link #{index + 1}</Label>
                <div>
                  <Label htmlFor={`image-src-${index.toString()}`} className="text-sm">Image URL</Label>
                  <Input
                    id={`image-src-${index.toString()}`}
                    value={image.src || ''}
                    onChange={(e) => updateNestedContent(['images', index.toString(), 'src'], e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor={`image-alt-${index.toString()}`} className="text-sm">Alt Text</Label>
                  <Input
                    id={`image-alt-${index.toString()}`}
                    value={image.alt || ''}
                    onChange={(e) => updateNestedContent(['images', index.toString(), 'alt'], e.target.value)}
                    placeholder="Image description"
                  />
                </div>
                <div>
                  <Label htmlFor={`image-title-${index.toString()}`} className="text-sm">Link Title</Label>
                  <Input
                    id={`image-title-${index.toString()}`}
                    value={image.title || ''}
                    onChange={(e) => updateNestedContent(['images', index.toString(), 'title'], e.target.value)}
                    placeholder="Click here"
                  />
                </div>
                <div>
                  <Label htmlFor={`image-link-${index.toString()}`} className="text-sm">Link URL</Label>
                  <Input
                    id={`image-link-${index.toString()}`}
                    value={image.link || ''}
                    onChange={(e) => updateNestedContent(['images', index.toString(), 'link'], e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            ))}
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => {
                const images = [...(content.images || [])];
                images.push({ src: "", alt: "", link: "", title: "" });
                updateContent('images', images);
              }}
            >
              Add Image with Link
            </Button>
          </div>
        );

      case 'video':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="video-provider">Video Provider</Label>
              <Select
                value={content.provider || 'youtube'}
                onValueChange={(value) => updateContent('provider', value)}
              >
                <SelectTrigger id="video-provider">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="vimeo">Vimeo</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="video-src">Video URL or ID</Label>
              <Input
                id="video-src"
                placeholder={content.provider === 'youtube' ? 'YouTube URL or video ID' : 'Video URL'}
                value={content.src || ''}
                onChange={(e) => updateContent('src', e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {content.provider === 'youtube' 
                  ? 'Enter a YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID) or just the video ID'
                  : content.provider === 'vimeo'
                  ? 'Enter a Vimeo URL (e.g., https://vimeo.com/VIDEO_ID)'
                  : 'Enter the URL of your video'}
              </p>
            </div>
            <div>
              <Label htmlFor="video-thumbnail">Thumbnail URL (Optional)</Label>
              <Input
                id="video-thumbnail"
                placeholder="https://example.com/thumbnail.jpg"
                value={content.thumbnail || ''}
                onChange={(e) => updateContent('thumbnail', e.target.value)}
              />
            </div>
          </div>
        );
      
      case 'testimonials':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <Label>Display Type</Label>
              <Select
                value={content.displayType || 'cards'}
                onValueChange={(value) => updateContent('displayType', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select display type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cards">Cards</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                  <SelectItem value="quotes">Quote Style</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(content.testimonials || [{ text: '', author: '' }, { text: '', author: '' }]).map((testimonial: any, index: number) => (
              <div key={index.toString()} className="space-y-2 border p-3 rounded-md">
                <Label>Testimonial #{index + 1}</Label>
                <div>
                  <Label htmlFor={`testimonial-text-${index.toString()}`} className="text-sm">Quote</Label>
                  <Textarea
                    id={`testimonial-text-${index.toString()}`}
                    value={testimonial.text || ''}
                    onChange={(e) => updateNestedContent(['testimonials', index.toString(), 'text'], e.target.value)}
                    placeholder="This product is amazing!"
                  />
                </div>
                <div>
                  <Label htmlFor={`testimonial-author-${index.toString()}`} className="text-sm">Author</Label>
                  <Input
                    id={`testimonial-author-${index.toString()}`}
                    value={testimonial.author || ''}
                    onChange={(e) => updateNestedContent(['testimonials', index.toString(), 'author'], e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
              </div>
            ))}
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => {
                const testimonials = [...(content.testimonials || [])];
                testimonials.push({ text: '', author: '' });
                updateContent('testimonials', testimonials);
              }}
            >
              Add Testimonial
            </Button>
          </div>
        );
        
      case 'smart feedback':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="feedback-question">Question</Label>
              <Input
                id="feedback-question"
                value={content.question || ''}
                onChange={(e) => updateContent('question', e.target.value)}
                placeholder="How would you rate our service?"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Options</Label>
              </div>
              {(content.options || ['Very satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very dissatisfied']).map((option: string, index: number) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(content.options || [])];
                      newOptions[index] = e.target.value;
                      updateContent('options', newOptions);
                    }}
                    placeholder={`Option ${index + 1}`}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    type="button" 
                    className="h-8 w-8"
                    onClick={() => {
                      const newOptions = [...(content.options || [])].filter((_, i) => i !== index);
                      updateContent('options', newOptions);
                    }}
                  >
                    &times;
                  </Button>
                </div>
              ))}
              <Button 
                variant="outline" 
                type="button" 
                size="sm"
                onClick={() => {
                  const options = [...(content.options || [])];
                  options.push(`Option ${options.length + 1}`);
                  updateContent('options', options);
                }}
              >
                Add Option
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="allow-comments"
                checked={content.allowComments || false}
                onCheckedChange={(checked) => updateContent('allowComments', checked)}
              />
              <Label htmlFor="allow-comments">Allow comments</Label>
            </div>
          </div>
        );
        
      case 'team':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <Label>Display Type</Label>
              <Select
                value={content.displayType || 'cards'}
                onValueChange={(value) => updateContent('displayType', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select display type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cards">Cards</SelectItem>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(content.members || [{ name: '', role: '', photo: '' }, { name: '', role: '', photo: '' }, { name: '', role: '', photo: '' }]).map((member: any, index: number) => (
              <div key={index.toString()} className="space-y-2 border p-3 rounded-md">
                <Label>Team Member #{index + 1}</Label>
                <div>
                  <Label htmlFor={`member-name-${index.toString()}`} className="text-sm">Name</Label>
                  <Input
                    id={`member-name-${index.toString()}`}
                    value={member.name || ''}
                    onChange={(e) => updateNestedContent(['members', index.toString(), 'name'], e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor={`member-role-${index.toString()}`} className="text-sm">Role</Label>
                  <Input
                    id={`member-role-${index.toString()}`}
                    value={member.role || ''}
                    onChange={(e) => updateNestedContent(['members', index.toString(), 'role'], e.target.value)}
                    placeholder="CEO"
                  />
                </div>
                <div>
                  <Label htmlFor={`member-photo-${index.toString()}`} className="text-sm">Photo URL</Label>
                  <Input
                    id={`member-photo-${index.toString()}`}
                    value={member.photo || ''}
                    onChange={(e) => updateNestedContent(['members', index.toString(), 'photo'], e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
              </div>
            ))}
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => {
                const members = [...(content.members || [])];
                members.push({ name: '', role: '', photo: '' });
                updateContent('members', members);
              }}
            >
              Add Team Member
            </Button>
          </div>
        );
        
      case 'button':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="button-text">Button Text</Label>
              <Input
                id="button-text"
                value={content.text || 'Click Here'}
                onChange={(e) => updateContent('text', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="button-url">Button URL</Label>
              <Input
                id="button-url"
                placeholder="https://example.com"
                value={content.url || ''}
                onChange={(e) => updateContent('url', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="button-style">Button Style</Label>
              <Select
                value={content.style || 'filled'}
                onValueChange={(value) => updateContent('style', value)}
              >
                <SelectTrigger id="button-style">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="filled">Filled</SelectItem>
                  <SelectItem value="outline">Outline</SelectItem>
                  <SelectItem value="ghost">Ghost</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
        
      case 'form':
        return (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Form Fields</Label>
              </div>
              {(content.fields || [
                { type: 'text', label: 'Name', required: true, placeholder: 'Enter your name' },
                { type: 'email', label: 'Email', required: true, placeholder: 'Enter your email' },
                { type: 'textarea', label: 'Message', required: false, placeholder: 'Enter your message' }
              ]).map((field: any, index: number) => (
                <div key={index} className="border p-3 rounded-md mb-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Field #{index + 1}</Label>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      type="button" 
                      className="h-8 w-8"
                      onClick={() => {
                        const newFields = [...(content.fields || [])].filter((_, i) => i !== index);
                        updateContent('fields', newFields);
                      }}
                    >
                      &times;
                    </Button>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Field Type</Label>
                    <Select
                      value={field.type}
                      onValueChange={(value) => {
                        const newFields = [...(content.fields || [])];
                        newFields[index] = { ...newFields[index], type: value };
                        updateContent('fields', newFields);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="tel">Phone</SelectItem>
                        <SelectItem value="textarea">Text Area</SelectItem>
                        <SelectItem value="select">Dropdown</SelectItem>
                        <SelectItem value="checkbox">Checkbox</SelectItem>
                        <SelectItem value="radio">Radio Buttons</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Label</Label>
                    <Input
                      value={field.label || ''}
                      onChange={(e) => {
                        const newFields = [...(content.fields || [])];
                        newFields[index] = { ...newFields[index], label: e.target.value };
                        updateContent('fields', newFields);
                      }}
                      placeholder="Field Label"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm">Placeholder</Label>
                    <Input
                      value={field.placeholder || ''}
                      onChange={(e) => {
                        const newFields = [...(content.fields || [])];
                        newFields[index] = { ...newFields[index], placeholder: e.target.value };
                        updateContent('fields', newFields);
                      }}
                      placeholder="Field Placeholder"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={field.required || false}
                      onCheckedChange={(checked) => {
                        const newFields = [...(content.fields || [])];
                        newFields[index] = { ...newFields[index], required: checked };
                        updateContent('fields', newFields);
                      }}
                    />
                    <Label>Required field</Label>
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                type="button"
                onClick={() => {
                  const fields = [...(content.fields || [])];
                  fields.push({ type: 'text', label: `Field ${fields.length + 1}`, required: false, placeholder: '' });
                  updateContent('fields', fields);
                }}
              >
                Add Form Field
              </Button>
            </div>
            
            <div>
              <Label htmlFor="submit-text">Submit Button Text</Label>
              <Input
                id="submit-text"
                value={content.submitText || 'Submit'}
                onChange={(e) => updateContent('submitText', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="submit-action">Form Action</Label>
              <Select
                value={content.submitAction || 'email'}
                onValueChange={(value) => updateContent('submitAction', value)}
              >
                <SelectTrigger id="submit-action">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Send Email</SelectItem>
                  <SelectItem value="database">Save to Database</SelectItem>
                  <SelectItem value="api">Custom API</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
        
      case 'contact form':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Label>Include field:</Label>
              <div className="grid grid-cols-3 gap-2">
                {['name', 'email', 'phone', 'subject', 'message'].map((field) => (
                  <div key={field} className="flex items-center space-x-2">
                    <Switch
                      id={`include-${field}`}
                      checked={(content.fields || ['name', 'email', 'message']).includes(field)}
                      onCheckedChange={(checked) => {
                        const fields = [...(content.fields || [])];
                        if (checked && !fields.includes(field)) {
                          fields.push(field);
                        } else if (!checked) {
                          const index = fields.indexOf(field);
                          if (index !== -1) fields.splice(index, 1);
                        }
                        updateContent('fields', fields);
                      }}
                    />
                    <Label htmlFor={`include-${field}`} className="text-sm capitalize">{field}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="submit-text">Submit Button Text</Label>
              <Input
                id="submit-text"
                value={content.submitText || 'Submit'}
                onChange={(e) => updateContent('submitText', e.target.value)}
              />
            </div>
          </div>
        );

      case 'map':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="map-location">Location</Label>
              <Input
                id="map-location"
                placeholder="Address or coordinates"
                value={content.location || ''}
                onChange={(e) => updateContent('location', e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter an address or coordinates (e.g., "New York, NY" or "40.7128,-74.0060")
              </p>
            </div>
          </div>
        );
        
      case 'social links':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <Label>Display Type</Label>
              <Select
                value={content.displayType || 'icons'}
                onValueChange={(value) => updateContent('displayType', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select display type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="icons">Icons</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="buttons">Buttons</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(content.links || [{ platform: 'twitter', url: '' }, { platform: 'facebook', url: '' }, { platform: 'instagram', url: '' }]).map((link: any, index: number) => (
              <div key={index} className="space-y-2 border p-3 rounded-md">
                <div>
                  <Label htmlFor={`social-platform-${index}`}>Platform</Label>
                  <Select
                    value={link.platform}
                    onValueChange={(value) => {
                      const newLinks = [...(content.links || [])];
                      newLinks[index] = { ...newLinks[index], platform: value };
                      updateContent('links', newLinks);
                    }}
                  >
                    <SelectTrigger id={`social-platform-${index}`}>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twitter">Twitter / X</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="pinterest">Pinterest</SelectItem>
                      <SelectItem value="github">GitHub</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`social-url-${index}`}>URL</Label>
                  <Input
                    id={`social-url-${index}`}
                    placeholder={`https://${link.platform}.com/username`}
                    value={link.url || ''}
                    onChange={(e) => {
                      const newLinks = [...(content.links || [])];
                      newLinks[index] = { ...newLinks[index], url: e.target.value };
                      updateContent('links', newLinks);
                    }}
                  />
                </div>
              </div>
            ))}
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => {
                const links = [...(content.links || [])];
                links.push({ platform: 'twitter', url: '' });
                updateContent('links', links);
              }}
            >
              Add Social Link
            </Button>
          </div>
        );
        
      case 'links':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <Label>Display Type</Label>
              <Select
                value={content.displayType || 'buttons'}
                onValueChange={(value) => updateContent('displayType', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select display type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buttons">Buttons</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="pills">Pills</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(content.links || [{ text: 'Link 1', url: '', icon: '' }, { text: 'Link 2', url: '', icon: '' }]).map((link: any, index: number) => (
              <div key={index} className="space-y-2 border p-3 rounded-md">
                <div>
                  <Label htmlFor={`link-text-${index}`}>Link Text</Label>
                  <Input
                    id={`link-text-${index}`}
                    value={link.text || ''}
                    onChange={(e) => {
                      const newLinks = [...(content.links || [])];
                      newLinks[index] = { ...newLinks[index], text: e.target.value };
                      updateContent('links', newLinks);
                    }}
                    placeholder="Link text"
                  />
                </div>
                <div>
                  <Label htmlFor={`link-url-${index}`}>URL</Label>
                  <Input
                    id={`link-url-${index}`}
                    placeholder="https://example.com"
                    value={link.url || ''}
                    onChange={(e) => {
                      const newLinks = [...(content.links || [])];
                      newLinks[index] = { ...newLinks[index], url: e.target.value };
                      updateContent('links', newLinks);
                    }}
                  />
                </div>
              </div>
            ))}
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => {
                const links = [...(content.links || [])];
                links.push({ text: `Link ${links.length + 1}`, url: '', icon: '' });
                updateContent('links', links);
              }}
            >
              Add Link
            </Button>
          </div>
        );
        
      case 'products':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <Label>Display Type</Label>
              <Select
                value={content.displayType || 'grid'}
                onValueChange={(value) => updateContent('displayType', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select display type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                  <SelectItem value="slider">Slider</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(content.products || [{ name: '', description: '', image: '', price: '', link: '' }]).map((product: any, index: number) => (
              <div key={index} className="space-y-2 border p-3 rounded-md">
                <Label>Product #{index + 1}</Label>
                <div>
                  <Label htmlFor={`product-name-${index}`} className="text-sm">Name</Label>
                  <Input
                    id={`product-name-${index}`}
                    value={product.name || ''}
                    onChange={(e) => updateNestedContent(['products', index.toString(), 'name'], e.target.value)}
                    placeholder="Product Name"
                  />
                </div>
                <div>
                  <Label htmlFor={`product-desc-${index}`} className="text-sm">Description</Label>
                  <Textarea
                    id={`product-desc-${index}`}
                    value={product.description || ''}
                    onChange={(e) => updateNestedContent(['products', index.toString(), 'description'], e.target.value)}
                    placeholder="Product description"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor={`product-image-${index}`} className="text-sm">Image URL</Label>
                  <Input
                    id={`product-image-${index}`}
                    value={product.image || ''}
                    onChange={(e) => updateNestedContent(['products', index.toString(), 'image'], e.target.value)}
                    placeholder="https://example.com/product.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor={`product-price-${index}`} className="text-sm">Price</Label>
                  <Input
                    id={`product-price-${index}`}
                    value={product.price || ''}
                    onChange={(e) => updateNestedContent(['products', index.toString(), 'price'], e.target.value)}
                    placeholder="99.99"
                  />
                </div>
                <div>
                  <Label htmlFor={`product-link-${index}`} className="text-sm">Buy Link</Label>
                  <Input
                    id={`product-link-${index}`}
                    value={product.link || ''}
                    onChange={(e) => updateNestedContent(['products', index.toString(), 'link'], e.target.value)}
                    placeholder="https://example.com/buy"
                  />
                </div>
              </div>
            ))}
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => {
                const products = [...(content.products || [])];
                products.push({ name: '', description: '', image: '', price: '', link: '' });
                updateContent('products', products);
              }}
            >
              Add Product
            </Button>
          </div>
        );
        
      case 'appointment/calendar':
        return (
          <div className="space-y-4">
            <div>
              <Label>Available Days</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Switch
                      checked={(content.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']).includes(day)}
                      onCheckedChange={(checked) => {
                        const days = [...(content.availableDays || [])];
                        if (checked && !days.includes(day)) {
                          days.push(day);
                        } else if (!checked) {
                          const index = days.indexOf(day);
                          if (index !== -1) days.splice(index, 1);
                        }
                        updateContent('availableDays', days);
                      }}
                    />
                    <Label className="text-sm">{day}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label>Time Slots</Label>
              <div className="border p-3 rounded-md mt-2 space-y-2">
                {(content.timeSlots || ['9:00', '10:00', '11:00', '13:00', '14:00', '15:00']).map((time: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={time}
                      onChange={(e) => {
                        const newTimes = [...(content.timeSlots || [])];
                        newTimes[index] = e.target.value;
                        updateContent('timeSlots', newTimes);
                      }}
                      placeholder="Time slot"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      type="button" 
                      className="h-8 w-8"
                      onClick={() => {
                        const newTimes = [...(content.timeSlots || [])].filter((_, i) => i !== index);
                        updateContent('timeSlots', newTimes);
                      }}
                    >
                      &times;
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  type="button"
                  size="sm"
                  onClick={() => {
                    const times = [...(content.timeSlots || [])];
                    times.push('');
                    updateContent('timeSlots', times);
                  }}
                >
                  Add Time Slot
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="contact-required"
                checked={content.contactRequired !== false}
                onCheckedChange={(checked) => updateContent('contactRequired', checked)}
              />
              <Label htmlFor="contact-required">Require contact information</Label>
            </div>
          </div>
        );

      case 'business hours':
        return (
          <div className="space-y-4">
            {(content.hours || [
              { day: "Monday", open: "9:00 AM", close: "5:00 PM", closed: false },
              { day: "Tuesday", open: "9:00 AM", close: "5:00 PM", closed: false },
              { day: "Wednesday", open: "9:00 AM", close: "5:00 PM", closed: false },
              { day: "Thursday", open: "9:00 AM", close: "5:00 PM", closed: false },
              { day: "Friday", open: "9:00 AM", close: "5:00 PM", closed: false },
              { day: "Saturday", open: "10:00 AM", close: "2:00 PM", closed: false },
              { day: "Sunday", open: "", close: "", closed: true }
            ]).map((hour: any, index: number) => (
              <div key={index} className="space-y-2 border p-3 rounded-md">
                <div className="flex items-center justify-between">
                  <Label>{hour.day}</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={hour.closed || false}
                      onCheckedChange={(checked) => {
                        const newHours = [...(content.hours || [])];
                        newHours[index] = { ...newHours[index], closed: checked };
                        updateContent('hours', newHours);
                      }}
                    />
                    <Label className="text-sm">Closed</Label>
                  </div>
                </div>
                
                {!hour.closed && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Label htmlFor={`hour-open-${index}`} className="text-sm">Open</Label>
                      <Input
                        id={`hour-open-${index}`}
                        value={hour.open || ''}
                        onChange={(e) => {
                          const newHours = [...(content.hours || [])];
                          newHours[index] = { ...newHours[index], open: e.target.value };
                          updateContent('hours', newHours);
                        }}
                        placeholder="9:00 AM"
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={`hour-close-${index}`} className="text-sm">Close</Label>
                      <Input
                        id={`hour-close-${index}`}
                        value={hour.close || ''}
                        onChange={(e) => {
                          const newHours = [...(content.hours || [])];
                          newHours[index] = { ...newHours[index], close: e.target.value };
                          updateContent('hours', newHours);
                        }}
                        placeholder="5:00 PM"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
        
      case 'pdf gallery':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <Label>Display Type</Label>
              <Select
                value={content.displayType || 'grid'}
                onValueChange={(value) => updateContent('displayType', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select display type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(content.pdfs || [{ title: '', file: '', thumbnail: '' }]).map((pdf: any, index: number) => (
              <div key={index} className="space-y-2 border p-3 rounded-md">
                <Label>Document #{index + 1}</Label>
                <div>
                  <Label htmlFor={`pdf-title-${index}`} className="text-sm">Title</Label>
                  <Input
                    id={`pdf-title-${index}`}
                    value={pdf.title || ''}
                    onChange={(e) => updateNestedContent(['pdfs', index.toString(), 'title'], e.target.value)}
                    placeholder="Document Title"
                  />
                </div>
                <div>
                  <Label htmlFor={`pdf-file-${index}`} className="text-sm">PDF URL</Label>
                  <Input
                    id={`pdf-file-${index}`}
                    value={pdf.file || ''}
                    onChange={(e) => updateNestedContent(['pdfs', index.toString(), 'file'], e.target.value)}
                    placeholder="https://example.com/document.pdf"
                  />
                </div>
                <div>
                  <Label htmlFor={`pdf-thumbnail-${index}`} className="text-sm">Thumbnail URL (Optional)</Label>
                  <Input
                    id={`pdf-thumbnail-${index}`}
                    value={pdf.thumbnail || ''}
                    onChange={(e) => updateNestedContent(['pdfs', index.toString(), 'thumbnail'], e.target.value)}
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                </div>
              </div>
            ))}
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => {
                const pdfs = [...(content.pdfs || [])];
                pdfs.push({ title: '', file: '', thumbnail: '' });
                updateContent('pdfs', pdfs);
              }}
            >
              Add PDF Document
            </Button>
          </div>
        );
        
      case 'other details':
        return (
          <div className="space-y-4">
            {(content.sections || [
              { title: 'Address', content: '' },
              { title: 'Phone', content: '' },
              { title: 'Email', content: '' }
            ]).map((section: any, index: number) => (
              <div key={index} className="space-y-2 border p-3 rounded-md">
                <div>
                  <Label htmlFor={`section-title-${index}`}>Section Title</Label>
                  <Input
                    id={`section-title-${index}`}
                    value={section.title || ''}
                    onChange={(e) => updateNestedContent(['sections', index.toString(), 'title'], e.target.value)}
                    placeholder="Section title"
                  />
                </div>
                <div>
                  <Label htmlFor={`section-content-${index}`}>Content</Label>
                  <Textarea
                    id={`section-content-${index}`}
                    value={section.content || ''}
                    onChange={(e) => updateNestedContent(['sections', index.toString(), 'content'], e.target.value)}
                    placeholder="Section content"
                    rows={2}
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-destructive hover:text-destructive" 
                  onClick={() => {
                    const newSections = [...(content.sections || [])].filter((_, i) => i !== index);
                    updateContent('sections', newSections);
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => {
                const sections = [...(content.sections || [])];
                sections.push({ title: '', content: '' });
                updateContent('sections', sections);
              }}
            >
              Add Detail Section
            </Button>
          </div>
        );
        
      case 'image + text':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="image-src">Image URL</Label>
              <Input
                id="image-src"
                placeholder="https://example.com/image.jpg"
                value={content.image?.src || ''}
                onChange={(e) => updateNestedContent(['image', 'src'], e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="image-alt">Alt Text</Label>
              <Input
                id="image-alt"
                placeholder="Image description"
                value={content.image?.alt || ''}
                onChange={(e) => updateNestedContent(['image', 'alt'], e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="layout-text">Text Content</Label>
              <Textarea
                id="layout-text"
                value={content.text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="layout-position">Image Position</Label>
              <Select
                value={content.layout || 'image-left'}
                onValueChange={(value) => updateContent('layout', value)}
              >
                <SelectTrigger id="layout-position">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image-left">Image on Left</SelectItem>
                  <SelectItem value="image-right">Image on Right</SelectItem>
                  <SelectItem value="image-top">Image on Top</SelectItem>
                  <SelectItem value="image-bottom">Image on Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
        
      // Add more case handlers for other block types as needed
      
      default:
        return (
          <div className="p-4 border rounded-md bg-gray-50">
            <p className="text-sm text-muted-foreground">
              Content editing not yet implemented for {block.type} blocks.
            </p>
          </div>
        );
    }
  };
  
  const renderStyleFields = () => {
    if (block.type === 'FORM') {
      return (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Container Styles</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Background Color</Label>
                <ColorPicker
                  value={styles.container?.backgroundColor || ''}
                  onChange={(color) => handleStyleChange('container', { backgroundColor: color })}
                />
              </div>
              <div>
                <Label>Padding</Label>
                <Select
                  value={styles.container?.padding || '16px'}
                  onValueChange={(value) => handleStyleChange('container', { padding: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select padding" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8px">Small (8px)</SelectItem>
                    <SelectItem value="16px">Medium (16px)</SelectItem>
                    <SelectItem value="24px">Large (24px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Label Styles</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Text Color</Label>
                <ColorPicker
                  value={styles.label?.textColor || ''}
                  onChange={(color) => handleStyleChange('label', { textColor: color })}
                />
              </div>
              <div>
                <Label>Font Size</Label>
                <Select
                  value={styles.label?.fontSize || 'inherit'}
                  onValueChange={(value) => handleStyleChange('label', { fontSize: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.875rem">Small (14px)</SelectItem>
                    <SelectItem value="1rem">Medium (16px)</SelectItem>
                    <SelectItem value="1.125rem">Large (18px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Input Styles</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Background Color</Label>
                <ColorPicker
                  value={styles.input?.backgroundColor || ''}
                  onChange={(color) => handleStyleChange('input', { backgroundColor: color })}
                />
              </div>
              <div>
                <Label>Border Color</Label>
                <ColorPicker
                  value={styles.input?.borderColor || ''}
                  onChange={(color) => handleStyleChange('input', { borderColor: color })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Button Styles</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Background Color</Label>
                <ColorPicker
                  value={styles.button?.backgroundColor || ''}
                  onChange={(color) => handleStyleChange('button', { backgroundColor: color })}
                />
              </div>
              <div>
                <Label>Text Color</Label>
                <ColorPicker
                  value={styles.button?.textColor || ''}
                  onChange={(color) => handleStyleChange('button', { textColor: color })}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Text Color */}
        <div>
          <Label htmlFor="text-color" className="mb-1">Text Color</Label>
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 border rounded-md" 
              style={{ backgroundColor: content.textColor }}
            />
            <Input
              id="text-color"
              type="color"
              value={content.textColor || '#000000'}
              onChange={(e) => updateContent('textColor', e.target.value)}
              className="w-14 h-10 p-1"
            />
            <Input 
              type="text"
              value={content.textColor || '#000000'}
              onChange={(e) => updateContent('textColor', e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
        
        {/* Background Color */}
        <div>
          <Label htmlFor="background-color" className="mb-1">Background Color</Label>
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 border rounded-md" 
              style={{ backgroundColor: content.backgroundColor === 'transparent' ? '#ffffff' : content.backgroundColor }}
            />
            <Input
              id="background-color"
              type="color"
              value={content.backgroundColor === 'transparent' ? '#ffffff' : content.backgroundColor || '#ffffff'}
              onChange={(e) => updateContent('backgroundColor', e.target.value === '#ffffff' ? 'transparent' : e.target.value)}
              className="w-14 h-10 p-1"
            />
            <Input 
              type="text"
              value={content.backgroundColor || 'transparent'}
              onChange={(e) => updateContent('backgroundColor', e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
        
        {/* Padding */}
        <div>
          <Label htmlFor="padding" className="mb-1">Padding</Label>
          <Select
            value={content.padding || '16px'}
            onValueChange={(value) => updateContent('padding', value)}
          >
            <SelectTrigger id="padding">
              <SelectValue placeholder="Select padding" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0px">None</SelectItem>
              <SelectItem value="8px">Small (8px)</SelectItem>
              <SelectItem value="16px">Medium (16px)</SelectItem>
              <SelectItem value="24px">Large (24px)</SelectItem>
              <SelectItem value="32px">Extra Large (32px)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Border Radius */}
        <div>
          <Label htmlFor="border-radius" className="mb-1">Border Radius</Label>
          <Select
            value={content.borderRadius || '4px'}
            onValueChange={(value) => updateContent('borderRadius', value)}
          >
            <SelectTrigger id="border-radius">
              <SelectValue placeholder="Select border radius" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0px">None</SelectItem>
              <SelectItem value="4px">Small (4px)</SelectItem>
              <SelectItem value="8px">Medium (8px)</SelectItem>
              <SelectItem value="16px">Large (16px)</SelectItem>
              <SelectItem value="9999px">Rounded</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Text Alignment */}
        <div>
          <Label htmlFor="text-align" className="mb-1">Text Alignment</Label>
          <Select
            value={content.textAlign || 'left'}
            onValueChange={(value: any) => updateContent('textAlign', value)}
          >
            <SelectTrigger id="text-align">
              <SelectValue placeholder="Select text alignment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Display specific style options based on block type */}
        {block.type === 'button' && (
          <>
            <div>
              <Label htmlFor="hover-color" className="mb-1">Hover Color</Label>
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 border rounded-md" 
                  style={{ backgroundColor: content.hoverColor }}
                />
                <Input
                  id="hover-color"
                  type="color"
                  value={content.hoverColor || '#2563EB'}
                  onChange={(e) => updateContent('hoverColor', e.target.value)}
                  className="w-14 h-10 p-1"
                />
              </div>
            </div>
          </>
        )}
        
        {['images', 'images + links', 'products', 'testimonials', 'team'].includes(block.type) && (
          <>
            <div>
              <Label htmlFor="gap" className="mb-1">Gap Between Items</Label>
              <Select
                value={content.gap || '16px'}
                onValueChange={(value) => updateContent('gap', value)}
              >
                <SelectTrigger id="gap">
                  <SelectValue placeholder="Select gap" />
                </SelectTrigger>¯
                <SelectContent>
                  <SelectItem value="0px">None</SelectItem>
                  <SelectItem value="8px">Small (8px)</SelectItem>
                  <SelectItem value="16px">Medium (16px)</SelectItem>
                  <SelectItem value="24px">Large (24px)</SelectItem>
                  <SelectItem value="32px">Extra Large (32px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {['testimonials', 'team', 'products'].includes(block.type) && (
              <>
                <div>
                  <Label htmlFor="card-bg-color" className="mb-1">Card Background Color</Label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 border rounded-md" 
                      style={{ backgroundColor: content.cardBgColor || '#FFFFFF' }}
                    />
                    <Input
                      id="card-bg-color"
                      type="color"
                      value={content.cardBgColor || '#FFFFFF'}
                      onChange={(e) => updateContent('cardBgColor', e.target.value)}
                      className="w-14 h-10 p-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="card-shadow" className="mb-1">Card Shadow</Label>
                  <Select
                    value={content.cardShadow || 'sm'}
                    onValueChange={(value) => updateContent('cardShadow', value)}
                  >
                    <SelectTrigger id="card-shadow">
                      <SelectValue placeholder="Select shadow" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="sm">Small</SelectItem>
                      <SelectItem value="md">Medium</SelectItem>
                      <SelectItem value="lg">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </>
        )}
        
        {block.type === 'image + text' && (
          <>
            <div>
              <Label className="mb-1">Image Width</Label>
              <div className="pt-4 pb-2">
                <Slider
                  defaultValue={[parseInt(content.imageWidth?.replace('%', '') || '50')]}
                  min={20}
                  max={80}
                  step={5}
                  onValueChange={(value) => updateContent('imageWidth', `${value[0]}%`)}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Narrow</span>
                <span>{content.imageWidth}</span>
                <span>Wide</span>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {block.type}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {renderContentEditor()}
          {renderStyleFields()}
        </div>
        
        <DialogFooter>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
