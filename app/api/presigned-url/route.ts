import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { path, type, operation = 'upload' } = await request.json();

    if (!path) {
      return NextResponse.json(
        { error: 'Missing required field: path' },
        { status: 400 }
      );
    }

    let command;
    if (operation === 'download') {
      command = new GetObjectCommand({
        Bucket: 'pyexekube',
        Key: path,
      });
    } else {
      if (!type) {
        return NextResponse.json(
          { error: 'Missing required field: type for upload operation' },
          { status: 400 }
        );
      }
      command = new PutObjectCommand({
        Bucket: 'pyexekube',
        Key: path,
        ContentType: type,
      });
    }

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate presigned URL' },
      { status: 500 }
    );
  }
}
