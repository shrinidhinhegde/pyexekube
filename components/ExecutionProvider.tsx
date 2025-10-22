'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface ExecutionState {
  isExecuting: boolean
  currentExecutionId: string | null
  logs: string[]
}

interface ExecutionContextType {
  executionState: ExecutionState
  startExecution: (executionId: string) => void
  updateLogs: (newLogs: string[]) => void
  addLog: (log: string) => void
  completeExecution: (success: boolean) => void
  resetExecution: () => void
}

const ExecutionContext = createContext<ExecutionContextType | undefined>(undefined)

export function ExecutionProvider({ children }: { children: React.ReactNode }) {
  const [executionState, setExecutionState] = useState<ExecutionState>({
    isExecuting: false,
    currentExecutionId: null,
    logs: [],
  })

  const startExecution = useCallback((executionId: string) => {
    setExecutionState({
      isExecuting: true,
      currentExecutionId: executionId,
      logs: [],
    })
  }, [])

  const updateLogs = useCallback((newLogs: string[]) => {
    setExecutionState(prev => ({
      ...prev,
      logs: newLogs,
    }))
  }, [])

  const addLog = useCallback((log: string) => {
    setExecutionState(prev => ({
      ...prev,
      logs: [...prev.logs, log],
    }))
  }, [])

  const completeExecution = useCallback((success: boolean) => {
    setExecutionState(prev => ({
      ...prev,
      isExecuting: false,
      currentExecutionId: null,
    }))
  }, [])

  const resetExecution = useCallback(() => {
    setExecutionState({
      isExecuting: false,
      currentExecutionId: null,
      logs: [],
    })
  }, [])

  return (
    <ExecutionContext.Provider
      value={{
        executionState,
        startExecution,
        updateLogs,
        addLog,
        completeExecution,
        resetExecution,
      }}
    >
      {children}
    </ExecutionContext.Provider>
  )
}

export function useExecution() {
  const context = useContext(ExecutionContext)
  if (context === undefined) {
    throw new Error('useExecution must be used within an ExecutionProvider')
  }
  return context
}
