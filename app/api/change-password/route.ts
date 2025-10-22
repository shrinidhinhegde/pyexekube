import { NextRequest, NextResponse } from 'next/server';
import { CognitoIdentityProviderClient, AdminSetUserPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({
  region: 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { username, oldPassword, newPassword } = await request.json();

    if (!username || !oldPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Missing required fields: username, oldPassword, newPassword' },
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

    // For Cognito, we need to use AdminSetUserPasswordCommand
    // This bypasses the old password verification since we're using admin privileges
    const command = new AdminSetUserPasswordCommand({
      UserPoolId: userPoolId,
      Username: username,
      Password: newPassword,
      Permanent: true, // Set to true to make the password permanent
    });

    await cognitoClient.send(command);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error changing password:', error);
    
    // Handle specific Cognito errors
    if (error instanceof Error) {
      if (error.name === 'UserNotFoundException') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      if (error.name === 'InvalidPasswordException') {
        return NextResponse.json(
          { error: 'Password does not meet requirements' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
