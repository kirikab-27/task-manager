import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        boardColumn: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, status, priority, dueDate, boardColumnId } = body

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'todo',
        priority: priority || 3,
        dueDate: dueDate ? new Date(dueDate) : null,
        boardColumnId,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        boardColumn: true,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}