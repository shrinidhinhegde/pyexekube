'use client'

import { useState, useEffect } from 'react'
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileSelector } from '@/components/codebase/FileSelector'
import { CodeEditor } from '@/components/codebase/CodeEditor'
import { AlertCircle, CheckCircle, Code, Hourglass } from 'lucide-react'
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
  const { executionState, startExecution, resetExecution } = useExecution()
  
  const userId = (session?.user as any)?.id

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 5000)
  }

  const handleExecute = async () => {
    if (executionState.isExecuting) {
      showAlert('error', 'An execution is already running. Please wait for it to finish before starting another one.')
      return
    }

    if (!code.trim()) {
      showAlert('error', 'Please write some Python code first!')
      return
    }

    if (!userId) {
      showAlert('error', 'Please log in to execute code')
      return
    }

    let executionId: string | null = null

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
      }

      showAlert('success', 'Execution submitted. Your job is now running.')
    } catch (error) {
      console.error('Execution error:', error)

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

      // Update execution record with error if we have an execution ID
      if (executionId) {
        try {
          await fetcher('/api/executions', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: executionId,
              status: 'FAILED',
              logs: `Failed to schedule execution job. ${errorMessage}`,
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

  useEffect(() => {
    if (!userId) {
      if (executionState.isExecuting || executionState.currentExecutionId) {
        resetExecution()
      }
      return
    }

    let isCancelled = false

    const checkRunning = async () => {
      try {
        const response = await fetcher(`/api/executions?userId=${userId}&status=RUNNING`)
        const running = (response.executions || [])[0]

        if (isCancelled) return

        if (running) {
          if (!executionState.isExecuting || executionState.currentExecutionId !== running.id) {
            startExecution(running.id)
          }
        } else if (executionState.isExecuting) {
          resetExecution()
        }
      } catch (error) {
        console.error('Error checking running executions:', error)
      }
    }

    checkRunning()
    const interval = setInterval(checkRunning, 5000)

    return () => {
      isCancelled = true
      clearInterval(interval)
    }
  }, [userId, executionState.isExecuting, executionState.currentExecutionId, startExecution, resetExecution])

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
        {executionState.isExecuting && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Hourglass className="h-5 w-5" />
                Execution In Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 space-y-2">
              <p>Your job is currently running. You will be able to start a new execution once it finishes.</p>
              <p>Visit the Execution History page to monitor progress and download results.</p>
            </CardContent>
          </Card>
        )}

        {!executionState.isExecuting && (
          <>
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
          </>
        )}
      </div>
    </div>
  )
}