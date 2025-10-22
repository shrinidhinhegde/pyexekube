import { NextRequest, NextResponse } from 'next/server';
import { getSignedUrl } from '@aws-sdk/cloudfront-signer';

export async function POST(request: NextRequest) {
  try {
    const { path, seconds = 600 } = await request.json();

    if (!path) {
      return NextResponse.json(
        { error: 'Missing required field: path' },
        { status: 400 }
      );
    }

    // Generate CloudFront signed URL for GET operations
    const url = getSignedUrl({
      url: `https://${process.env.CLOUDFRONT_DOMAIN}/${path}`,
      keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
      privateKey: process.env.CLOUDFRONT_PRIVATE_KEY!,
      dateLessThan: new Date(Date.now() + seconds * 1000).toISOString(),
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error generating CloudFront signed URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate CloudFront signed URL' },
      { status: 500 }
    );
  }
}
