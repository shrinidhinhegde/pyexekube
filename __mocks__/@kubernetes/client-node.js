const mockApi = {
  createNamespacedJob: jest.fn().mockResolvedValue({}),
  readNamespacedJob: jest
    .fn()
    .mockResolvedValue({ body: { status: { succeeded: 1 } } }),
  deleteNamespacedJob: jest.fn().mockResolvedValue({}),
};

class KubeConfig {
  loadFromCluster() {}
  loadFromDefault() {}
  makeApiClient() {
    return mockApi;
  }
}

module.exports = {
  KubeConfig,
  BatchV1Api: class {},
  V1DeleteOptions: class {},
  V1EnvVar: class {},
  V1Job: class {},
};
