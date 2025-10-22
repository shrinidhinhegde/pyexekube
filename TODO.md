# PyExeKube Development Roadmap

## 🚀 Current Status
PyExeKube is a containerized Python execution platform built with Next.js, Prisma, AWS Cognito, and Kubernetes. The application provides a web interface for writing, executing, and managing Python code in a scalable cloud environment.

## 📋 Development Tasks

### 🔧 Backend Infrastructure

#### 1. Lambda Function Integration
- [ ] **Cognito User Sync Lambda**
  - Implement AWS Lambda function to sync Cognito user changes with Prisma database
  - Handle user creation, updates, and deletion events
  - Call the `/api/users` CRUD endpoints
  - Set up CloudWatch triggers for Cognito events
  - Add error handling and retry logic

#### 2. Kubernetes Compute Engine
- [ ] **K8s Job Controller**
  - Design Kubernetes Job specifications for Python code execution
  - Implement resource limits and security contexts
  - Create custom Python execution images with required dependencies
  - Set up persistent volume claims for input/output files
  - Configure network policies and service accounts

- [ ] **Code Execution Pipeline**
  - Build Docker images for Python execution environments
  - Implement file upload/download mechanisms
  - Create execution queue management system
  - Add support for requirements.txt and custom packages
  - Implement timeout and resource monitoring

#### 3. Real-time Logging System
- [ ] **WebSocket Implementation**
  - Set up WebSocket server for live log streaming
  - Integrate with Kubernetes pod logs
  - Implement log filtering and formatting
  - Add connection management and error handling
  - Create frontend WebSocket client integration

- [ ] **Log Management**
  - Design log storage strategy (CloudWatch, S3, or database)
  - Implement log rotation and cleanup policies
  - Add log search and filtering capabilities
  - Create log export functionality

### 🎨 Frontend Enhancements

#### 4. Execution Interface Improvements
- [ ] **Real-time Execution Status**
  - Update execution cards with live status updates
  - Create execution cancellation functionality

### ☁️ Deployment & Infrastructure

#### 5. AWS EKS Deployment
- [ ] **Kubernetes Cluster Setup**
  - Configure EKS cluster with appropriate node groups
  - Set up cluster autoscaling
  - Configure RBAC and security policies
  - Implement monitoring and logging (CloudWatch, Prometheus)

- [ ] **Application Deployment**
  - Set up CI/CD pipeline with GitHub Actions
  - Configure ingress controllers and load balancers

#### 6. AWS Amplify Hosting
- [ ] **Next.js Application Deployment**
  - Configure Amplify for Next.js SSR

### 📚 Documentation & Testing

#### 7. Documentation
- [ ] **Testing**
  - Add integration tests for Kubernetes jobs


## 🔗 Related Resources
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [AWS EKS User Guide](https://docs.aws.amazon.com/eks/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Documentation](https://www.prisma.io/docs/)

---

*Maintained by: PyExeKube Development Team*
