import { NextRequest, NextResponse } from 'next/server';
import { CognitoIdentityProviderClient, AdminUpdateUserAttributesCommand } from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({
  region: 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { image_path, name, sub } = await request.json();

    if (!sub) {
      return NextResponse.json(
        { error: 'Missing required field: sub' },
        { status: 400 }
      );
    }

    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    if (!userPoolId) {
      return NextResponse.json(
        { error: 'COGNITO_USER_POOL_ID not configured' },
        { status: 500 }
      );
    }

    const attributes = [];
    
    if (name) {
      attributes.push({
        Name: 'name',
        Value: name,
      });
    }
    
    if (image_path) {
      attributes.push({
        Name: 'picture',
        Value: image_path,
      });
    }

    if (attributes.length === 0) {
      return NextResponse.json(
        { error: 'No attributes to update' },
        { status: 400 }
      );
    }

    const command = new AdminUpdateUserAttributesCommand({
      UserPoolId: userPoolId,
      Username: sub,
      UserAttributes: attributes,
    });

    await cognitoClient.send(command);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating Cognito user:', error);
    return NextResponse.json(
      { error: 'Failed to update user attributes' },
      { status: 500 }
    );
  }
}
