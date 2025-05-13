import React from 'react';
import { Block } from '@/types/block';
import { FileSelector } from '../FileSelector';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface ImageTextBlockProps {
  block: Block;
  onChange: (block: Block) => void;
  brandId: string;
}

export const ImageTextBlock: React.FC<ImageTextBlockProps> = ({
  block,
  onChange,
  brandId
}) => {
  const handleChange = (field: string, value: any) => {
    onChange({
      ...block,
      content: {
        ...block.content,
        [field]: value
      }
    });
  };

  const handleImageSelect = (file: any) => {
    if (file && typeof file === 'object') {
      handleChange('image', {
        url: file.url || file,
        alt: file.alt || file.name || 'Image'
      });
    } else if (typeof file === 'string') {
      handleChange('image', {
        url: file,
        alt: 'Image'
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          value={block.content.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Enter section title"
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={block.content.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter section description"
        />
      </div>

      <div className="space-y-2">
        <Label>Image</Label>
        <FileSelector
          type="image"
          onSelect={handleImageSelect}
          brandId={brandId}
          value={block.content.image?.url}
        />
      </div>

      <div className="space-y-2">
        <Label>Image Position</Label>
        <Select
          value={block.content.imagePosition || 'left'}
          onValueChange={(value) => handleChange('imagePosition', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select image position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="right">Right</SelectItem>
            <SelectItem value="top">Top</SelectItem>
            <SelectItem value="bottom">Bottom</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}; 