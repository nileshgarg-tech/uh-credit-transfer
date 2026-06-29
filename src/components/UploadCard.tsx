import { UploadCloud } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReactNode, useRef } from 'react';
import { toast } from 'sonner';

interface UploadCardProps {
  title: string;
  icon: ReactNode;
  onFileSelect: (file: File) => void;
}

export function UploadCard({ title, icon, onFileSelect }: UploadCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
      toast.success('File received – displaying estimate', {
        duration: 1500,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full h-full rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-xl font-semibold">
          <span className="mr-2 text-2xl">{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
        <div 
          className="w-full h-32 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center bg-muted/30 cursor-pointer hover:border-muted-foreground/50 transition-colors"
          role="button"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onClick={handleUploadClick}
        >
          <UploadCloud className="w-10 h-10 text-muted-foreground/70" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">Upload your transcript to see potential transfer credits</p>
          <Button 
            className="w-full mt-4 bg-red-700 hover:bg-red-800"
            onClick={handleUploadClick}
          >
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload PDF
          </Button>
          <input 
            ref={fileInputRef}
            id={`file-upload-${title.replace(/\s+/g, '-').toLowerCase()}`}
            type="file" 
            accept=".pdf"
            className="hidden" 
            onChange={handleFileChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}