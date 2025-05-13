import { landingPageTemplates } from '@/templates/landingPageTemplates';

interface TemplateSelectorProps {
  onSelect: (template: any) => void;
}

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {landingPageTemplates.map(template => (
        <div
          key={template.id}
          className="border rounded-lg p-4 cursor-pointer hover:shadow"
          onClick={() => onSelect(template)}
        >
          <h3 className="text-lg font-bold mb-2">{template.name}</h3>
          {/* Optionally show a preview image or block count */}
          <div className="h-32 bg-gray-100 flex items-center justify-center mb-2">
            <span className="text-gray-400">Preview</span>
          </div>
          <p className="text-sm text-gray-500">{template.blocks.length} sections</p>
        </div>
      ))}
    </div>
  );
} 