"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetcher } from '@/lib/utils';

interface FileItem {
  key: string;
  name: string;
  size: number;
  lastModified: string;
  etag: string;
}

interface FileSelectorProps {
  onFileSelect: (file: FileItem | null) => void;
  selectedFile: FileItem | null;
  disabled?: boolean;
}

export function FileSelector({ onFileSelect, selectedFile, disabled = false }: FileSelectorProps) {
  const { data: session } = useSession();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const userId = (session?.user as any)?.id;

  const loadFiles = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await fetcher(`/api/files?userId=${userId}`);
      // Filter to only show zip files as an additional safety measure
      const zipFiles = (response.files || []).filter((file: FileItem) => 
        file.name.toLowerCase().endsWith('.zip')
      );
      setFiles(zipFiles);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadFiles();
    }
  }, [userId]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleFileChange = (fileKey: string) => {
    const file = files.find(f => f.key === fileKey) || null;
    onFileSelect(file);
    setOpen(false);
  };

  if (!userId) {
    return (
      <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
        <File className="h-4 w-4" />
        <span className="text-sm text-muted-foreground">Please log in to select files</span>
      </div>
    );
  }

  const handleOpenChange = (value: boolean) => {
    if (disabled) return;
    setOpen(value);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Select Input File (Optional)</label>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={loading || disabled}
          >
            {selectedFile ? selectedFile.name : "Choose a ZIP file..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search files..." />
            <CommandList>
              <CommandEmpty>
                {loading ? "Loading files..." : "No files found."}
              </CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="none"
                  onSelect={() => handleFileChange('')}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      !selectedFile ? "opacity-100" : "opacity-0"
                    )}
                  />
                  No file selected
                </CommandItem>
                {files.map((file) => (
                  <CommandItem
                    key={file.key}
                    value={`${file.name} ${file.key}`}
                    onSelect={() => handleFileChange(file.key)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedFile?.key === file.key ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} • {formatDate(file.lastModified)}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedFile && (
        <div className="text-xs text-muted-foreground">
          Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
        </div>
      )}
    </div>
  );
}