import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { BlockEditor } from './BlockEditor';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Grip, Trash2, Pencil } from 'lucide-react';
import { Block, BlockType } from '@/types/block';
import { BlockEditorMain } from './block-renderers/BlockEditorMain';
import { BlockContent } from '@/types/block';

interface SortableBlockProps {
  block: Block;
  onDeleteBlock: (blockId: string) => void;
  onUpdateBlock: (blockId: string, content: BlockContent, styles: Record<string, string>) => void;
  openMediaLibrary: (blockId: string, fieldPath: string, altPath?: string) => void;
  brandId: string;
}

const SortableBlock = ({ block, onDeleteBlock, onUpdateBlock, openMediaLibrary, brandId }: SortableBlockProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleUpdateBlock = (updatedBlock: { id: string; type: string; content: Record<string, any>; brandId?: string }) => {
    onUpdateBlock(updatedBlock.id, updatedBlock.content as BlockContent, {});
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group border rounded-lg shadow p-4 mb-4 bg-white"
    >
      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onDeleteBlock(block.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-grab"
          {...attributes}
          {...listeners}
        >
          <Grip className="h-4 w-4" />
        </Button>
      </div>

      {isEditing ? (
        <BlockEditor
          block={{
            id: block.id,
            type: block.type,
            content: block.content,
            brandId: brandId
          }}
          onUpdateBlock={handleUpdateBlock}
          openMediaLibrary={() => openMediaLibrary(block.id, 'content.image.src', 'content.image.alt')}
          brandId={brandId}
        />
      ) : (
        <div className="py-2">
          <BlockEditorMain
            blockType={block.type as BlockType}
            content={block.content as BlockContent}
            styles={{}}
          />
        </div>
      )}
    </div>
  );
};

interface PageEditorCanvasProps {
  blocks: Block[];
  onDeleteBlock: (id: string) => void;
  onUpdateBlock: (id: string, content: Record<string, any>, styles: Record<string, any>) => void;
  openMediaLibrary: (blockId: string, fieldPath: string, altPath?: string) => void;
  pageStyles: {
    backgroundColor: string;
    fontFamily: string;
  };
  brandId: string;
}

export function PageEditorCanvas({
  blocks,
  onDeleteBlock,
  onUpdateBlock,
  openMediaLibrary,
  pageStyles,
  brandId
}: PageEditorCanvasProps) {
  return (
    <div className="flex-1 h-[calc(100vh-4rem)] flex flex-col">
      <ScrollArea className="flex-1 h-full">
        <div 
          className="p-8 min-h-full"
          style={{
            backgroundColor: pageStyles.backgroundColor,
            fontFamily: pageStyles.fontFamily
          }}
        >
          <div className="max-w-2xl mx-auto">
            {blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <p className="text-muted-foreground mb-4">No blocks added yet</p>
                <p className="text-muted-foreground text-sm mb-4">Use the sidebar to add content blocks</p>
              </div>
            ) : (
              <div className="space-y-6">
                {blocks.map((block) => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    onDeleteBlock={onDeleteBlock}
                    onUpdateBlock={onUpdateBlock}
                    openMediaLibrary={openMediaLibrary}
                    brandId={brandId}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
