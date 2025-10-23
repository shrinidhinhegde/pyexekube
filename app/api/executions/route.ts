import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/executions - Get all executions for a user
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

    const executions = await prisma.executionHistory.findMany({
      where: { userId },
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
