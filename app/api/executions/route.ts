import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { prisma } from '@/lib/prisma';
import { createExecutionJob } from '@/lib/kubernetes';

const bucketName = process.env.S3_BUCKET_NAME;
const s3Region = process.env.S3_REGION ?? process.env.AWS_REGION ?? 'us-east-2';

const s3Client =
  bucketName && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? new S3Client({
        region: s3Region,
        endpoint: process.env.AWS_S3_ENDPOINT,
        forcePathStyle: Boolean(process.env.AWS_S3_FORCE_PATH_STYLE === 'true'),
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          ...(process.env.AWS_SESSION_TOKEN
            ? { sessionToken: process.env.AWS_SESSION_TOKEN }
            : {}),
        },
      })
    : null;

function ensureJobPrerequisites() {
  if (!bucketName) {
    throw new Error('S3_BUCKET_NAME environment variable is not configured.');
  }
  if (!s3Client) {
    throw new Error('AWS credentials are not configured for S3 access.');
  }
  if (!process.env.EXECUTION_CALLBACK_URL) {
    throw new Error('Missing EXECUTION_CALLBACK_URL environment variable.');
  }
}

async function uploadToS3(key: string, body: string | Uint8Array, contentType?: string) {
  if (!s3Client || !bucketName) {
    throw new Error('S3 client not initialized.');
  }
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: body,
    ContentType: contentType,
  });
  await s3Client.send(command);
}

// GET /api/executions - Get all executions for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const executions = await prisma.executionHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ executions });
  } catch (error) {
    console.error('Error fetching executions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch executions' },
      { status: 500 }
    );
  }
}

// POST /api/executions - Create a new execution record
export async function POST(request: NextRequest) {
  try {
    const { userId, code, requirements, inputFile } = await request.json();

    if (!userId || !code) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, code' },
        { status: 400 }
      );
    }

    const execution = await prisma.executionHistory.create({
      data: {
        userId,
        code,
        requirements: requirements || null,
        inputFile: inputFile || null,
        status: 'RUNNING',
      },
    });

    try {
      ensureJobPrerequisites();

      const artifactsBaseKey = `executions/${execution.id}`;
      const codeKey = `${artifactsBaseKey}/main.py`;
      const requirementsKey =
        requirements && requirements.trim().length > 0
          ? `${artifactsBaseKey}/requirements.txt`
          : undefined;
      const outputKey = `${artifactsBaseKey}/output.zip`;

      await uploadToS3(codeKey, code, 'text/x-python');

      if (requirementsKey) {
        await uploadToS3(requirementsKey, requirements!, 'text/plain');
      }

      await createExecutionJob({
        executionId: execution.id,
        userId,
        codeKey,
        requirementsKey,
        inputKey: inputFile ?? undefined,
        outputKey,
        callbackUrl: process.env.EXECUTION_CALLBACK_URL!,
      });
    } catch (error: any) {
      console.error('Failed to schedule execution job:', error);
      await prisma.executionHistory.update({
        where: { id: execution.id },
        data: {
          status: 'FAILED',
          logs:
            'Failed to schedule execution job. ' +
            (error?.message ?? 'Unknown error scheduling Kubernetes job.'),
        },
      });
      return NextResponse.json(
        { error: 'Failed to schedule execution job.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ execution });
  } catch (error) {
    console.error('Error creating execution:', error);
    return NextResponse.json(
      { error: 'Failed to create execution' },
      { status: 500 }
    );
  }
}

// PUT /api/executions - Update execution status and results
export async function PUT(request: NextRequest) {
  try {
    const { id, status, logs, outputFile } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: id, status' },
        { status: 400 }
      );
    }

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (logs !== undefined) updateData.logs = logs;
    if (outputFile !== undefined) updateData.outputFile = outputFile;
    
    // Set completedAt if execution is finished
    if (status === 'SUCCESS' || status === 'FAILED') {
      updateData.completedAt = new Date();
    }

    const execution = await prisma.executionHistory.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ execution });
  } catch (error) {
    console.error('Error updating execution:', error);
    return NextResponse.json(
      { error: 'Failed to update execution' },
      { status: 500 }
    );
  }
}

// DELETE /api/executions - Delete an execution record
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Missing execution id' },
        { status: 400 }
      );
    }

    await prisma.executionHistory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting execution:', error);
    return NextResponse.json(
      { error: 'Failed to delete execution' },
      { status: 500 }
    );
  }
}
