'use client'

import { useState } from 'react'
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileSelector } from '@/components/codebase/FileSelector'
import { CodeEditor } from '@/components/codebase/CodeEditor'
import { AlertCircle, CheckCircle, Terminal, Code } from 'lucide-react'
import { fetcher } from '@/lib/utils'
import { useExecution } from '@/components/ExecutionProvider'

interface FileItem {
  key: string;
  name: string;
  size: number;
  lastModified: string;
  etag: string;
}

export default function Home() {
  const { status, data: session } = useSession()
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [code, setCode] = useState('')
  const [requirements, setRequirements] = useState('')
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const { executionState, startExecution, addLog, completeExecution, resetExecution } = useExecution()
  
  const userId = (session?.user as any)?.id

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 5000)
  }

  const handleExecute = async () => {
    if (!code.trim()) {
      showAlert('error', 'Please write some Python code first!')
      return
    }

    if (!userId) {
      showAlert('error', 'Please log in to execute code')
      return
    }

    let executionId: string | null = null
    const executionLogs: string[] = [] // Local array to collect logs

    try {
      // Create execution record
      const createResponse = await fetcher('/api/executions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          code,
          requirements,
          inputFile: selectedFile?.key || null,
        }),
      })
      
      executionId = createResponse.execution.id
      if (executionId) {
        startExecution(executionId)
        addLog('Starting execution...')
        executionLogs.push('Starting execution...')
      }

      // TODO: Implement actual execution API call
      // For now, just simulate execution with live logs
      addLog('Extracting input files...')
      executionLogs.push('Extracting input files...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (requirements.trim()) {
        addLog('Installing Python dependencies...')
        executionLogs.push('Installing Python dependencies...')
        addLog(`pip install -r requirements.txt`)
        executionLogs.push(`pip install -r requirements.txt`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        addLog('Dependencies installed successfully!')
        executionLogs.push('Dependencies installed successfully!')
      }
      
      addLog('Running Python code...')
      executionLogs.push('Running Python code...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      addLog('Processing output files...')
      executionLogs.push('Processing output files...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      addLog('Execution completed successfully!')
      executionLogs.push('Execution completed successfully!')
      
      // Update execution record with success
      await fetcher('/api/executions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: executionId,
          status: 'SUCCESS',
          logs: executionLogs.join('\n'),
          outputFile: 'output/results.zip', // This would come from actual execution
        }),

        // TODO: end of the upper todo. this needs to be done in the backend. call the k8s etc.
      })
      
      completeExecution(true)
      showAlert('success', 'Code executed successfully!')
    } catch (error) {
      console.error('Execution error:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      addLog(`ERROR: ${errorMessage}`)
      executionLogs.push(`ERROR: ${errorMessage}`)
      
      // Update execution record with error if we have an execution ID
      if (executionId) {
        try {
          await fetcher('/api/executions', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: executionId,
              status: 'FAILED',
              logs: executionLogs.join('\n'),
            }),
          })
        } catch (updateError) {
          console.error('Failed to update execution record:', updateError)
        }
      }
      
      resetExecution()
      showAlert('error', 'Failed to execute code')
    }
  }

  if (status === "loading") {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 min-h-screen max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold flex items-center gap-3 mb-4">
          <Code className="h-10 w-10 text-blue-600" />
          Codebase
        </h1>
        <p className="text-lg text-muted-foreground">
          Write and execute Python code with file management capabilities.
        </p>
      </div>

      {/* Alert Messages */}
      {alert && (
        <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="mb-6">
          {alert.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* File Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Input Files</CardTitle>
          </CardHeader>
          <CardContent>
            <FileSelector 
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
            />
          </CardContent>
        </Card>

        {/* Code Editor */}
        <Card>
          <CardContent className="pt-6">
            <CodeEditor
              code={code}
              onCodeChange={setCode}
              requirements={requirements}
              onRequirementsChange={setRequirements}
              onExecute={handleExecute}
              executing={executionState.isExecuting}
            />
          </CardContent>
        </Card>

        {/* Live Execution Logs */}
        {executionState.isExecuting && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-blue-600" />
                Live Execution Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
                {executionState.logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    <span className="text-gray-400">[{new Date().toLocaleTimeString()}]</span> {log}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}