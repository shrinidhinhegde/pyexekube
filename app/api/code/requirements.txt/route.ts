import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Save requirements.txt file
export async function POST(request: NextRequest) {
  try {
    const { userId, requirements } = await request.json();

    if (!userId || requirements === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, requirements' },
        { status: 400 }
      );
    }

    const key = `files/${userId}/requirements.txt`;

    const command = new PutObjectCommand({
      Bucket: 'pyexekube',
      Key: key,
      Body: requirements,
      ContentType: 'text/plain',
    });

    await s3Client.send(command);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving requirements.txt:', error);
    return NextResponse.json(
      { error: 'Failed to save requirements' },
      { status: 500 }
    );
  }
}

// Load requirements.txt file
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const key = `files/${userId}/requirements.txt`;

    try {
      const command = new GetObjectCommand({
        Bucket: 'pyexekube',
        Key: key,
      });

      const response = await s3Client.send(command);
      const requirements = await response.Body?.transformToString() || '';

      return NextResponse.json({ requirements });
    } catch (error: any) {
      // If file doesn't exist, return empty requirements
      if (error.name === 'NoSuchKey') {
        return NextResponse.json({ requirements: '' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error loading requirements.txt:', error);
    return NextResponse.json(
      { error: 'Failed to load requirements' },
      { status: 500 }
    );
  }
}
