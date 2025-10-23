"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useSession } from 'next-auth/react';
import { fetcher } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, ExternalLink, Package } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  requirements: string;
  onRequirementsChange: (requirements: string) => void;
  onExecute: () => void;
  executing: boolean;
}

export function CodeEditor({ code, onCodeChange, requirements, onRequirementsChange, onExecute, executing }: CodeEditorProps) {
  const { data: session } = useSession();
  const [editorHeight, setEditorHeight] = useState(400);
  const [saving, setSaving] = useState(false);
  const [savingRequirements, setSavingRequirements] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [lastSavedRequirements, setLastSavedRequirements] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const requirementsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const userId = (session?.user as any)?.id;

  // Auto-save function for main.py
  const saveCode = useCallback(async (codeToSave: string) => {
    if (!userId || !codeToSave.trim()) return;

    setSaving(true);
    try {
      await fetcher('/api/code/main.py', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code: codeToSave }),
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setSaving(false);
    }
  }, [userId]);

  // Auto-save function for requirements.txt
  const saveRequirements = useCallback(async (requirementsToSave: string) => {
    if (!userId) return; // Allow empty requirements.txt

    setSavingRequirements(true);
    try {
      await fetcher('/api/code/requirements.txt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, requirements: requirementsToSave }),
      });
      setLastSavedRequirements(new Date());
    } catch (error) {
      console.error('Requirements auto-save failed:', error);
    } finally {
      setSavingRequirements(false);
    }
  }, [userId]);

  // Debounced auto-save for main.py
  const debouncedSave = useCallback((codeToSave: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveCode(codeToSave);
    }, 2000); // Save 2 seconds after user stops typing
  }, [saveCode]);

  // Debounced auto-save for requirements.txt
  const debouncedSaveRequirements = useCallback((requirementsToSave: string) => {
    if (requirementsTimeoutRef.current) {
      clearTimeout(requirementsTimeoutRef.current);
    }
    
    requirementsTimeoutRef.current = setTimeout(() => {
      saveRequirements(requirementsToSave);
    }, 2000); // Save 2 seconds after user stops typing
  }, [saveRequirements]);

  // Handle code changes
  const handleCodeChange = (newCode: string | undefined) => {
    if (executing) return; // Don't allow changes during execution
    const codeValue = newCode || '';
    onCodeChange(codeValue);
    debouncedSave(codeValue);
  };

  // Handle requirements changes
  const handleRequirementsChange = (newRequirements: string | undefined) => {
    if (executing) return; // Don't allow changes during execution
    const requirementsValue = newRequirements || '';
    onRequirementsChange(requirementsValue);
    debouncedSaveRequirements(requirementsValue);
  };

  // Load saved code and requirements on mount
  useEffect(() => {
    const loadSavedFiles = async () => {
      if (!userId) return;

      try {
        // Load main.py
        const codeResponse = await fetcher(`/api/code/main.py?userId=${userId}`);
        if (codeResponse.code) {
          onCodeChange(codeResponse.code);
        }

        // Load requirements.txt
        const requirementsResponse = await fetcher(`/api/code/requirements.txt?userId=${userId}`);
        if (requirementsResponse.requirements) {
          onRequirementsChange(requirementsResponse.requirements);
        }
      } catch (error) {
        console.error('Failed to load saved files:', error);
      }
    };

    loadSavedFiles();
  }, [userId, onCodeChange, onRequirementsChange]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (requirementsTimeoutRef.current) {
        clearTimeout(requirementsTimeoutRef.current);
      }
    };
  }, []);

  const handleEditorDidMount = (editor: any) => {
    // Set up Python-specific configurations
    editor.getModel()?.updateOptions({
      tabSize: 4,
      insertSpaces: true,
    });
  };

  const defaultPythonCode = `# Welcome to pyexekube!
# Write your Python code here

def main():
    print("Hello, World!")
    
    # Your code goes here
    pass

if __name__ == "__main__":
    main()
`;

  const defaultRequirements = `# Add your Python package dependencies here
# Example:
# requests==2.31.0
# numpy==1.24.3
# pandas==2.0.3
`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Code Editor</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/info" className="flex items-center gap-1">
              <ExternalLink className="h-4 w-4" />
              How It Works
            </a>
          </Button>
          
          <Button
            onClick={onExecute}
            disabled={executing}
            className="flex items-center gap-2"
          >
            {executing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Execute
              </>
            )}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="main.py" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="main.py" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            main.py
          </TabsTrigger>
          <TabsTrigger value="requirements.txt" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            requirements.txt
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="main.py" className="space-y-2">
          <div className="border rounded-lg overflow-hidden">
            <Editor
              height={editorHeight}
              defaultLanguage="python"
              value={code || defaultPythonCode}
              onChange={handleCodeChange}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: 'on',
                tabSize: 4,
                insertSpaces: true,
                padding: { top: 16, bottom: 16 },
                readOnly: executing, // Disable editing during execution
              }}
            />
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Python 3.x</span>
              <span>•</span>
              <span>Syntax highlighting enabled</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                {saving ? (
                  <>
                    <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Saved {lastSaved.toLocaleTimeString()}</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    <span>Auto-save enabled</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditorHeight(Math.max(200, editorHeight - 50))}
                className="px-2 py-1 text-xs border rounded hover:bg-muted"
              >
                -
              </button>
              <span className="text-xs">{editorHeight}px</span>
              <button
                onClick={() => setEditorHeight(Math.min(800, editorHeight + 50))}
                className="px-2 py-1 text-xs border rounded hover:bg-muted"
              >
                +
              </button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="requirements.txt" className="space-y-2">
          <div className="border rounded-lg overflow-hidden">
            <Editor
              height={editorHeight}
              defaultLanguage="plaintext"
              value={requirements || defaultRequirements}
              onChange={handleRequirementsChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: 'on',
                tabSize: 2,
                insertSpaces: true,
                padding: { top: 16, bottom: 16 },
                readOnly: executing, // Disable editing during execution
              }}
            />
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>pip install format</span>
              <span>•</span>
              <span>One package per line</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                {savingRequirements ? (
                  <>
                    <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : lastSavedRequirements ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Saved {lastSavedRequirements.toLocaleTimeString()}</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    <span>Auto-save enabled</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditorHeight(Math.max(200, editorHeight - 50))}
                className="px-2 py-1 text-xs border rounded hover:bg-muted"
              >
                -
              </button>
              <span className="text-xs">{editorHeight}px</span>
              <button
                onClick={() => setEditorHeight(Math.min(800, editorHeight + 50))}
                className="px-2 py-1 text-xs border rounded hover:bg-muted"
              >
                +
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}