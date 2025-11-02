import {
  BatchV1Api,
  KubeConfig,
  V1DeleteOptions,
  V1EnvVar,
  V1Job,
} from '@kubernetes/client-node';
import { randomUUID } from 'crypto';

type ExecutionJobOptions = {
  executionId: string;
  userId: string;
  codeKey: string;
  requirementsKey?: string;
  inputKey?: string;
  outputKey: string;
  callbackUrl: string;
  image?: string;
  namespace?: string;
};

let batchApi: BatchV1Api | null = null;

function getBatchApi(): BatchV1Api {
  if (batchApi) {
    return batchApi;
  }

  const kubeConfig = new KubeConfig();

  if (process.env.KUBERNETES_SERVICE_HOST) {
    kubeConfig.loadFromCluster();
  } else {
    kubeConfig.loadFromDefault();
  }

  batchApi = kubeConfig.makeApiClient(BatchV1Api);
  return batchApi;
}

export async function createExecutionJob(options: ExecutionJobOptions) {
  const {
    executionId,
    userId,
    codeKey,
    requirementsKey,
    inputKey,
    outputKey,
    callbackUrl,
    image = process.env.EXECUTION_JOB_IMAGE ?? 'python:3.12-slim',
    namespace = process.env.K8S_NAMESPACE ?? 'default',
  } = options;

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('Missing AWS credentials in environment variables.');
  }

  const awsRegion = process.env.S3_REGION ?? process.env.AWS_REGION;

  if (!awsRegion) {
    throw new Error('Missing S3_REGION or AWS_REGION environment variable.');
  }

  const jobName = `exec-${executionId.toLowerCase()}-${randomUUID().slice(0, 8)}`.replace(/[^a-z0-9-]/g, '-');

  const envVars: V1EnvVar[] = [
    { name: 'AWS_ACCESS_KEY_ID', value: process.env.AWS_ACCESS_KEY_ID },
    { name: 'AWS_SECRET_ACCESS_KEY', value: process.env.AWS_SECRET_ACCESS_KEY },
    ...(process.env.AWS_SESSION_TOKEN ? [{ name: 'AWS_SESSION_TOKEN', value: process.env.AWS_SESSION_TOKEN }] : []),
    { name: 'AWS_REGION', value: awsRegion },
    { name: 'S3_BUCKET_NAME', value: process.env.S3_BUCKET_NAME! },
    { name: 'CODE_KEY', value: codeKey },
    { name: 'OUTPUT_KEY', value: outputKey },
    { name: 'EXECUTION_ID', value: executionId },
    { name: 'USER_ID', value: userId },
    { name: 'EXECUTION_CALLBACK_URL', value: callbackUrl },
  ];

  if (process.env.EXECUTION_UPDATE_TOKEN) {
    envVars.push({
      name: 'EXECUTION_UPDATE_TOKEN',
      value: process.env.EXECUTION_UPDATE_TOKEN,
    });
  }

  if (requirementsKey) {
    envVars.push({ name: 'REQUIREMENTS_KEY', value: requirementsKey });
  }

  if (inputKey) {
    envVars.push({ name: 'INPUT_KEY', value: inputKey });
  }

  const pythonWorker = `
import os
import traceback
import zipfile
import io
import subprocess
import sys
import importlib


def ensure_module(module_name, extra_args=None):
    try:
        return importlib.import_module(module_name)
    except ModuleNotFoundError:
        args = [sys.executable, '-m', 'pip', 'install', '--no-cache-dir', module_name]
        if extra_args:
            args.extend(extra_args)
        install = subprocess.run(args, capture_output=True, text=True)
        if install.returncode != 0:
            raise RuntimeError(f'Failed to install {module_name}: {install.stderr}')
        return importlib.import_module(module_name)


boto3 = ensure_module('boto3')
requests = ensure_module('requests')


def send_update(status, logs='', output_key=None):
    payload = {'id': os.environ['EXECUTION_ID'], 'status': status}
    if logs:
        payload['logs'] = logs
    if output_key:
        payload['outputFile'] = output_key
    headers = {'Content-Type': 'application/json'}
    token = os.environ.get('EXECUTION_UPDATE_TOKEN')
    if token:
        headers['x-execution-token'] = token
    try:
        resp = requests.put(
            os.environ['EXECUTION_CALLBACK_URL'],
            json=payload,
            headers=headers,
            timeout=30,
        )
        resp.raise_for_status()
    except Exception as exc:
        print(f'Failed to send execution update: {exc}', flush=True)


def main():
    bucket = os.environ['S3_BUCKET_NAME']
    code_key = os.environ['CODE_KEY']
    output_key = os.environ['OUTPUT_KEY']
    requirements_key = os.environ.get('REQUIREMENTS_KEY')
    input_key = os.environ.get('INPUT_KEY')

    workspace = '/workspace'
    input_dir = os.path.join(workspace, 'input')
    output_dir = os.path.join(workspace, 'output')
    os.makedirs(input_dir, exist_ok=True)
    os.makedirs(output_dir, exist_ok=True)

    s3 = boto3.client('s3', region_name=os.environ['AWS_REGION'])
    logs = []

    def log(section, message):
        logs.append(f"[{section}] {message}")

    try:
        # Download main.py
        code_obj = s3.get_object(Bucket=bucket, Key=code_key)
        code_path = os.path.join(workspace, 'main.py')
        with open(code_path, 'wb') as f:
            f.write(code_obj['Body'].read())
        log('runner', f'Downloaded code from {code_key}')

        # Download requirements and install
        if requirements_key:
            req_obj = s3.get_object(Bucket=bucket, Key=requirements_key)
            req_path = os.path.join(workspace, 'requirements.txt')
            with open(req_path, 'wb') as f:
                f.write(req_obj['Body'].read())
            log('runner', f'Downloaded requirements from {requirements_key}')

            install = subprocess.run(
                ['pip', 'install', '--no-cache-dir', '-r', req_path],
                capture_output=True,
                text=True,
            )
            if install.stdout:
                log('pip stdout', install.stdout.strip())
            if install.stderr:
                log('pip stderr', install.stderr.strip())
            if install.returncode != 0:
                raise RuntimeError('Failed to install requirements.')
        else:
            log('runner', 'No requirements specified; skipping install.')

        # Download and extract input zip
        if input_key:
            input_obj = s3.get_object(Bucket=bucket, Key=input_key)
            log('runner', f'Downloaded input from {input_key}')
            with zipfile.ZipFile(io.BytesIO(input_obj['Body'].read())) as zf:
                zf.extractall(input_dir)
                file_list = zf.namelist()
            if file_list:
                log('runner', 'Input archive contents: ' + ', '.join(file_list))
            else:
                log('runner', 'Input archive is empty.')
            log('runner', 'Extracted input archive.')
        else:
            log('runner', 'No input file provided.')

        # Execute the user code
        env = os.environ.copy()
        env['INPUT_DIR'] = input_dir
        env['OUTPUT_DIR'] = output_dir
        run = subprocess.run(
            ['python', code_path],
            capture_output=True,
            text=True,
            cwd=workspace,
            env=env,
        )
        if run.stdout:
            log('code stdout', run.stdout.strip())
        if run.stderr:
            log('code stderr', run.stderr.strip())
        if run.returncode != 0:
            raise RuntimeError(f'Execution failed with exit code {run.returncode}')

        # Zip output directory
        output_buffer = io.BytesIO()
        with zipfile.ZipFile(output_buffer, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, _, files in os.walk(output_dir):
                for file_name in files:
                    file_path = os.path.join(root, file_name)
                    arcname = os.path.relpath(file_path, output_dir)
                    zipf.write(file_path, arcname)
        output_buffer.seek(0)

        s3.put_object(
            Bucket=bucket,
            Key=output_key,
            Body=output_buffer.read(),
            ContentType='application/zip',
        )
        log('runner', f'Uploaded output archive to {output_key}')

        send_update('SUCCESS', '\\n'.join(logs), output_key)
    except Exception as exc:
        log('runner', ''.join(traceback.format_exception(exc)))
        send_update('FAILED', '\\n'.join(logs))
        raise


if __name__ == '__main__':
    main()
`;

  const commandScript = `
set -euo pipefail
mkdir -p /workspace/input /workspace/output
python - <<'PYTHON'
${pythonWorker}
PYTHON
`;

  const job: V1Job = {
    apiVersion: 'batch/v1',
    kind: 'Job',
    metadata: {
      name: jobName,
      namespace,
      labels: {
        'app.kubernetes.io/name': 'execution-runner',
        'app.kubernetes.io/component': 'worker',
        'app.kubernetes.io/instance': executionId,
      },
    },
    spec: {
      backoffLimit: 0,
      template: {
        metadata: {
          labels: {
            'app.kubernetes.io/name': 'execution-runner',
            'app.kubernetes.io/instance': executionId,
          },
        },
        spec: {
          restartPolicy: 'Never',
          containers: [
            {
              name: 'runner',
              image,
              imagePullPolicy: 'IfNotPresent',
              command: ['/bin/bash', '-c', commandScript],
              env: envVars,
            },
          ],
        },
      },
    },
  };

  const api = getBatchApi();
  await api.createNamespacedJob({ namespace, body: job });

  async function cleanupJob(status: string) {
    try {
      await api.deleteNamespacedJob({
        name: jobName,
        namespace,
        body: {
          propagationPolicy: 'Background',
          gracePeriodSeconds: 0,
        } satisfies V1DeleteOptions,
      });
    } catch (cleanupError) {
      console.error(`Failed to delete job ${jobName} after ${status}:`, cleanupError);
    }
  }

  async function pollJobCompletion() {
    const pollInterval =
      Number.parseInt(process.env.EXECUTION_JOB_POLL_INTERVAL_MS ?? '5000', 10) || 5000;
    const maxAttempts =
      Number.parseInt(process.env.EXECUTION_JOB_POLL_ATTEMPTS ?? '120', 10) || 120;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        const jobBody = await api.readNamespacedJob({
          name: jobName,
          namespace,
        });
        const succeeded = Boolean(jobBody.status?.succeeded && jobBody.status.succeeded > 0);
        const failed = Boolean(jobBody.status?.failed && jobBody.status.failed > 0);

        if (succeeded || failed) {
          const status = succeeded ? 'succeeded' : 'failed';
          await cleanupJob(status);
          return;
        }
      } catch (error) {
        console.error(`Error polling job ${jobName}:`, error);
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    try {
      await cleanupJob('timeout');
    } catch (error) {
      console.error(`Cleanup timeout for job ${jobName} failed:`, error);
    }
  }

  pollJobCompletion().catch((error) =>
    console.error(`Async cleanup watcher for job ${jobName} failed:`, error)
  );
}

