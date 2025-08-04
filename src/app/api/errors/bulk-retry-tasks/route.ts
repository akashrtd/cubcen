import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { taskIds } = await request.json()

    // Mock bulk retry response
    const results = taskIds.map((taskId: string) => ({
      taskId,
      success: Math.random() > 0.2, // 80% success rate
      message: Math.random() > 0.2 ? 'Task queued for retry' : 'Failed to queue task',
    }))

    const successCount = results.filter((r: any) => r.success).length
    const failureCount = results.length - successCount

    return NextResponse.json({
      success: true,
      data: {
        results,
        summary: {
          total: results.length,
          successful: successCount,
          failed: failureCount,
        },
      },
      message: `Bulk retry completed: ${successCount} successful, ${failureCount} failed`,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'BULK_RETRY_ERROR',
          message: 'Failed to process bulk retry request',
        },
      },
      { status: 500 }
    )
  }
}