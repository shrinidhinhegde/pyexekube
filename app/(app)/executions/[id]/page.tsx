'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  ArrowLeft,
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Code, 
  Download,
  Calendar,
  Terminal,
  User
} from 'lucide-react'
import { fetcher } from '@/lib/utils'
import { useExecution } from '@/components/ExecutionProvider'

interface ExecutionHistory {
  id: string
  userId: string
  status: 'RUNNING' | 'SUCCESS' | 'FAILED'
  inputFile: string | null
  outputFile: string | null
  code: string
  requirements: string | null
  logs: string | null
  createdAt: string
  updatedAt: string
  completedAt: string | null
}

export default function ExecutionDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const [execution, setExecution] = useState<ExecutionHistory | null>(null)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState<string | null>(null)
  const { executionState } = useExecution()

  const userId = (session?.user as any)?.id
  const executionId = params.id as string

  const loadExecution = async () => {
    if (!userId || !executionId) return
    
    setLoading(true)
    try {
      const response = await fetcher(`/api/executions?userId=${userId}`)
      const executions = response.executions || []
      const foundExecution = executions.find((e: ExecutionHistory) => e.id === executionId)
      
      if (foundExecution) {
        setExecution(foundExecution)
      } else {
        router.push('/executions')
      }
    } catch (error) {
      console.error('Error loading execution:', error)
      router.push('/executions')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (fileKey: string, fileName: string) => {
    if (!fileKey) return

    setDownloading(fileKey)
    try {
      // Get presigned URL for download
      const response = await fetcher('/api/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          path: fileKey,
          operation: 'download'
        }),
      })

      // Create download link
      const link = document.createElement('a')
      link.href = response.url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading file:', error)
    } finally {
      setDownloading(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return <Clock className="h-5 w-5 text-blue-500" />
      case 'SUCCESS':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Running</Badge>
      case 'SUCCESS':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Success</Badge>
      case 'FAILED':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatDuration = (start: string, end: string | null) => {
    if (!end) return 'Still running...'
    const startTime = new Date(start).getTime()
    const endTime = new Date(end).getTime()
    const duration = endTime - startTime
    const seconds = Math.floor(duration / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${remainingSeconds}s`
  }

  useEffect(() => {
    if (userId && executionId) {
      loadExecution()
    }
  }, [userId, executionId])

  if (!userId) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
              <p className="text-muted-foreground">Please log in to view execution details.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading execution details...</p>
        </div>
      </div>
    )
  }

  if (!execution) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Execution Not Found</h3>
              <p className="text-muted-foreground mb-4">The requested execution could not be found.</p>
              <Button onClick={() => router.push('/executions')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8 min-h-screen max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" onClick={() => router.push('/executions')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to History
          </Button>
          <div className="flex items-center gap-3">
            {getStatusIcon(execution.status)}
            <h1 className="text-3xl font-bold">
              Execution #{execution.id.slice(-8)}
            </h1>
            {getStatusBadge(execution.status)}
          </div>
        </div>
        <p className="text-lg text-muted-foreground">
          Detailed view of your Python code execution
        </p>
      </div>

      <div className="space-y-6">
        {/* Execution Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Execution Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Started:</span> {formatDate(execution.createdAt)}
                </div>
                {execution.completedAt && (
                  <div>
                    <span className="font-medium">Completed:</span> {formatDate(execution.completedAt)}
                  </div>
                )}
                <div>
                  <span className="font-medium">Duration:</span> {formatDuration(execution.createdAt, execution.completedAt)}
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Status:</span> {getStatusBadge(execution.status)}
                </div>
                <div>
                  <span className="font-medium">Execution ID:</span> {execution.id}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Files */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-medium">Input File</div>
                    <div className="text-sm text-muted-foreground">
                      {execution.inputFile ? execution.inputFile.split('/').pop() : 'No input file'}
                    </div>
                  </div>
                </div>
                {execution.inputFile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(execution.inputFile!, execution.inputFile!.split('/').pop()!)}
                    disabled={downloading === execution.inputFile}
                  >
                    {downloading === execution.inputFile ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="font-medium">Output File</div>
                    <div className="text-sm text-muted-foreground">
                      {execution.outputFile ? execution.outputFile.split('/').pop() : 'No output file'}
                    </div>
                  </div>
                </div>
                {execution.outputFile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(execution.outputFile!, execution.outputFile!.split('/').pop()!)}
                    disabled={downloading === execution.outputFile}
                  >
                    {downloading === execution.outputFile ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Python Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                <pre className="whitespace-pre-wrap">{execution.code}</pre>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Requirements */}
        {execution.requirements && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Requirements.txt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                  <pre className="whitespace-pre-wrap">{execution.requirements}</pre>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Execution Logs
              {execution.status === 'RUNNING' && executionState.isExecuting && executionState.currentExecutionId === execution.id && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">Live</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg font-mono text-sm">
                {execution.status === 'RUNNING' && executionState.isExecuting && executionState.currentExecutionId === execution.id ? (
                  <div className="space-y-1">
                    {executionState.logs.length > 0 ? (
                      executionState.logs.map((log, index) => (
                        <div key={index} className="flex">
                          <span className="text-gray-400 mr-2">[{new Date().toLocaleTimeString()}]</span>
                          <span>{log}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-400">Waiting for logs...</div>
                    )}
                  </div>
                ) : execution.logs ? (
                  <pre className="whitespace-pre-wrap">{execution.logs}</pre>
                ) : (
                  <div className="text-gray-400">No logs available for this execution.</div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
