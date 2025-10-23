import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileType, userId } = await request.json();

    if (!fileName || !fileType || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: fileName, fileType, userId' },
        { status: 400 }
      );
    }

    // Generate a unique key for the file
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `files/${userId}/${timestamp}_${sanitizedFileName}`;

    const command = new PutObjectCommand({
      Bucket: 'pyexekube',
      Key: key,
      ContentType: fileType,
    });

    const url = await getSignedUrl(s3Client, command, { 
      expiresIn: 3600, // 1 hour
      signableHeaders: new Set(['host', 'content-type']),
    });

    return NextResponse.json({ 
      uploadUrl: url,
      fileKey: key,
      fileName: sanitizedFileName
    });
  } catch (error) {
    console.error('Error generating file upload URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}