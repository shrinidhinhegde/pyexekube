import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as getS3SignedUrl } from '@aws-sdk/s3-request-presigner';
import { getSignedUrl as getCloudFrontSignedUrl } from '@aws-sdk/cloudfront-signer';

const bucketName = process.env.S3_BUCKET_NAME;
const s3Region = process.env.S3_REGION ?? process.env.AWS_REGION ?? 'us-east-2';
const s3Endpoint = process.env.AWS_S3_ENDPOINT;
const forcePathStyle = Boolean(process.env.AWS_S3_FORCE_PATH_STYLE === 'true');

const s3Client =
  bucketName && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? new S3Client({
        region: s3Region,
        endpoint: s3Endpoint,
        forcePathStyle,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          ...(process.env.AWS_SESSION_TOKEN
            ? { sessionToken: process.env.AWS_SESSION_TOKEN }
            : {}),
        },
      })
    : null;

export async function POST(request: NextRequest) {
  try {
    const { path, type, operation = 'upload', expiresIn = 3600 } = await request.json();

    if (!path) {
      return NextResponse.json(
        { error: 'Missing required field: path' },
        { status: 400 }
      );
    }

    if (!bucketName) {
      return NextResponse.json(
        { error: 'S3 bucket is not configured on the server.' },
        { status: 500 }
      );
    }

    if (!s3Client) {
      return NextResponse.json(
        { error: 'S3 client is not configured on the server.' },
        { status: 500 }
      );
    }

    if (operation === 'download') {
      const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN;
      const cloudFrontKeyId = process.env.CLOUDFRONT_KEY_PAIR_ID;
      const cloudFrontPrivateKey = process.env.CLOUDFRONT_PRIVATE_KEY;

      if (cloudFrontDomain && cloudFrontKeyId && cloudFrontPrivateKey) {
        const url = getCloudFrontSignedUrl({
          url: `https://${cloudFrontDomain}/${path}`,
          keyPairId: cloudFrontKeyId,
          privateKey: cloudFrontPrivateKey,
          dateLessThan: new Date(Date.now() + expiresIn * 1000).toISOString(),
        });

        return NextResponse.json({ url });
      }

      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: path,
      });

      const url = await getS3SignedUrl(s3Client, getCommand, { expiresIn });
      return NextResponse.json({ url });
    }

    if (!type) {
      return NextResponse.json(
        { error: 'Missing required field: type for upload operation' },
        { status: 400 }
      );
    }

    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: path,
      ContentType: type,
    });

    const url = await getS3SignedUrl(s3Client, putCommand, { expiresIn });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate presigned URL' },
      { status: 500 }
    );
  }
}
