# Vercel Clone - Distributed Deployment Platform

A scalable, distributed system for deploying web applications, inspired by Vercel. This project allows users to deploy static React/Node.js applications from a Git repository URL.

## 🏗 Architecture

The system consists of three decoupled microservices and a shared orchestration layer:

### 1. Upload Service (Port 3000)
- **Role**: Entry point for deployments.
- **Functionality**:
  - Accepts a GitHub repository URL via REST API.
  - Clones the repository locally.
  - Uploads the source code to **AWS S3**.
  - Pushes a "build job" to a **Redis** queue.
  - Publishes the deployment status.

### 2. Deploy Service (Worker)
- **Role**: Background worker for building applications.
- **Functionality**:
  - Subscribes to the Redis queue.
  - Pulls source code from S3.
  - Builds the project (e.g., `npm install && npm run build`).
  - Uploads the build artifacts (`dist/` or `build/`) back to S3.

### 3. Request Service (Port 3001)
- **Role**: Serves the deployed applications.
- **Functionality**:
  - Intercepts incoming HTTP requests.
  - Determines the project ID from the subdomain (e.g., `id.100xdevs.com`).
  - Fetches the corresponding file from S3 and serves it to the user.

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Queue/Messaging**: Redis (Pub/Sub & List)
- **Storage**: AWS S3
- **Tools**: Simple Git, Docker (optional for containerization)

## 🚀 Getting Started

### Prerequisites

- Node.js & npm
- Redis server running locally or remotely
- AWS Credentials (Access Key, Secret Key, Endpoint) with S3 access

### Environment Variables

Each service requires specific environment variables. Create `.env` files in `deploy-service`, `request-service`, and `upload-service`:

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_ENDPOINT=your_endpoint_url
```

### Running the Services

You need to run all three services simultaneously.

1.  **Start Request Service**
    ```bash
    cd request-service
    npm install
    npm run dev
    ```

2.  **Start Upload Service**
    ```bash
    cd upload-service
    npm install
    npm run dev
    ```

3.  **Start Deploy Service**
    ```bash
    cd deploy-service
    npm install
    npm run dev
    ```

## 📡 API Usage

**Deploy a Repository**

```http
POST http://localhost:3000/deploy
Content-Type: application/json

{
    "repoUrl": "https://github.com/username/my-react-app"
}
```

**Response:**
```json
{
    "id": "a1b2c"
}
```

**Access Deployment**
Navigate to `http://a1b2c.100xdevs.com:3001/index.html` (map `*.100xdevs.com` to localhost in `/etc/hosts` for local testing).