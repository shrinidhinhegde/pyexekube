'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  History, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Download,
  Trash2,
  Eye,
  User
} from 'lucide-react'
import { fetcher } from '@/lib/utils'

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

export default function ExecutionHistoryPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [executions, setExecutions] = useState<ExecutionHistory[]>([])
  const [loading, setLoading] = useState(false)

  const userId = (session?.user as any)?.id

  const loadExecutions = async () => {
    if (!userId) return
    
    setLoading(true)
    try {
      const response = await fetcher(`/api/executions?userId=${userId}`)
      setExecutions(response.executions || [])
    } catch (error) {
      console.error('Error loading executions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this execution?')) return

    try {
      await fetcher('/api/executions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      await loadExecutions()
    } catch (error) {
      console.error('Error deleting execution:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
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
    if (userId) {
      loadExecutions()
    }
  }, [userId])

  if (!userId) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
              <p className="text-muted-foreground">Please log in to view your execution history.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8 min-h-screen max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold flex items-center gap-3 mb-4">
          <History className="h-10 w-10 text-blue-600" />
          Execution History
        </h1>
        <p className="text-lg text-muted-foreground">
          View and manage your Python code execution history.
        </p>
      </div>

      <div className="space-y-6">
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="ml-3">Loading executions...</span>
              </div>
            </CardContent>
          </Card>
        ) : executions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Executions Yet</h3>
                <p className="text-muted-foreground">
                  Start by running some Python code to see your execution history here.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {executions.map((execution) => (
              <Card key={execution.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(execution.status)}
                      <div>
                        <CardTitle className="text-lg">
                          Execution #{execution.id.slice(-8)}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(execution.status)}
                          <span className="text-sm text-muted-foreground">
                            {formatDuration(execution.createdAt, execution.completedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/executions/${execution.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(execution.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Input:</span>
                      <span className="text-muted-foreground">
                        {execution.inputFile ? execution.inputFile.split('/').pop() : 'No input file'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Download className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Output:</span>
                      <span className="text-muted-foreground">
                        {execution.outputFile ? execution.outputFile.split('/').pop() : 'No output file'}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Code Preview:</span> {execution.code.substring(0, 100)}
                      {execution.code.length > 100 && '...'}
                    </div>
                    {execution.requirements && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Requirements:</span> {execution.requirements.substring(0, 100)}
                        {execution.requirements.length > 100 && '...'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
