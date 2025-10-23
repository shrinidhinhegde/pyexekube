import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Save main.py file
export async function POST(request: NextRequest) {
  try {
    const { userId, code } = await request.json();

    if (!userId || code === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, code' },
        { status: 400 }
      );
    }

    const key = `files/${userId}/main.py`;

    const command = new PutObjectCommand({
      Bucket: 'pyexekube',
      Key: key,
      Body: code,
      ContentType: 'text/plain',
    });

    await s3Client.send(command);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving main.py:', error);
    return NextResponse.json(
      { error: 'Failed to save code' },
      { status: 500 }
    );
  }
}

// Load main.py file
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

    const key = `files/${userId}/main.py`;

    try {
      const command = new GetObjectCommand({
        Bucket: 'pyexekube',
        Key: key,
      });

      const response = await s3Client.send(command);
      const code = await response.Body?.transformToString() || '';

      return NextResponse.json({ code });
    } catch (error: any) {
      // If file doesn't exist, return empty code
      if (error.name === 'NoSuchKey') {
        return NextResponse.json({ code: '' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error loading main.py:', error);
    return NextResponse.json(
      { error: 'Failed to load code' },
      { status: 500 }
    );
  }
}