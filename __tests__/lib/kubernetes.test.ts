let createExecutionJob: any

// Use the manual mock in `__mocks__/@kubernetes/client-node.js` so tests
// can run without an actual Kubernetes client installed.

// Make randomUUID deterministic for tests
jest.mock('crypto', () => ({ randomUUID: () => 'fixeduuid' }))

describe('createExecutionJob', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    // require the module after resetting modules so our manual mocks are used
    createExecutionJob = require('@/lib/kubernetes').createExecutionJob
    process.env = { ...OLD_ENV }

    // Minimal env required by createExecutionJob
    process.env.AWS_ACCESS_KEY_ID = 'AKIA_TEST'
    process.env.AWS_SECRET_ACCESS_KEY = 'SECRET_TEST'
    process.env.S3_BUCKET_NAME = 'test-bucket'
    process.env.S3_REGION = 'us-west-2'
    process.env.EXECUTION_JOB_IMAGE = 'python:3.12-slim'
  })

  afterEach(() => {
    process.env = OLD_ENV
    jest.clearAllMocks()
  })

  it('throws when missing AWS credentials', async () => {
    delete process.env.AWS_ACCESS_KEY_ID
    delete process.env.AWS_SECRET_ACCESS_KEY

    await expect(
      createExecutionJob({
        executionId: 'ABC',
        userId: 'user1',
        codeKey: 'code.zip',
        outputKey: 'out.zip',
        callbackUrl: 'http://example.com',
      })
    ).rejects.toThrow('Missing AWS credentials')
  })

  it('calls createNamespacedJob with expected job payload', async () => {
    // require the mocked client to grab the api mock instance
    const { KubeConfig } = require('@kubernetes/client-node')
    const mockApi = new KubeConfig().makeApiClient()

    await createExecutionJob({
      executionId: 'EX-123',
      userId: 'u1',
      codeKey: 'codes/key',
      outputKey: 'out/key',
      callbackUrl: 'http://cb',
      namespace: 'test-ns',
      image: 'python:3.12-slim',
    })

    expect(mockApi.createNamespacedJob).toHaveBeenCalled()

    const callArg = mockApi.createNamespacedJob.mock.calls[0][0]
    expect(callArg.namespace).toBe('test-ns')

    const job = callArg.body
    expect(job).toBeDefined()
    expect(job.metadata.namespace).toBe('test-ns')

    const container = job.spec.template.spec.containers[0]
    const envNames = container.env.map((e: any) => e.name)

    expect(envNames).toEqual(
      expect.arrayContaining([
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'S3_BUCKET_NAME',
        'CODE_KEY',
        'OUTPUT_KEY',
        'EXECUTION_ID',
        'USER_ID',
        'EXECUTION_CALLBACK_URL',
      ])
    )
  })
})
