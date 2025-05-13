import { Block, LandingPage } from "./PageBuilder";

export interface PageEditorCanvasProps {
  blocks: Block[];
  onDeleteBlock: (blockId: string) => void;
  onUpdateBlock: (blockId: string, updatedContent: Record<string, any>, updatedStyles: Record<string, any>) => void;
  openMediaLibrary: (blockId: string, fieldPath: string, altPath?: string) => void;
  pageStyles: {
    backgroundColor: string;
    fontFamily: string;
  };
}

export interface PageEditorPreviewProps {
  blocks: Block[];
  pageStyles: {
    backgroundColor: string;
    fontFamily: string;
  };
}

export interface PageEditorSidebarProps {
  onAddBlock: (blockType: string, content?: any) => void;
}

export interface PageSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageData: LandingPage;
  onUpdate: (updatedSettings: Partial<LandingPage>) => void;
}

export interface PageBuilderProps {
  userId: string;
  pageId?: string;
}
