import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';

class TaskService {
  async createTask(userId, taskData) {
    const { projectId, ...rest } = taskData;

    // Check if user has access to project
    const projectMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (!projectMember) {
      throw new ApiError(403, 'You do not have access to this project');
    }

    if (projectMember.role === 'VIEWER') {
      throw new ApiError(403, 'Viewers cannot create tasks');
    }

    const task = await prisma.task.create({
      data: {
        ...rest,
        projectId,
        createdById: userId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return task;
  }

  async getTaskById(taskId, userId) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
            teamId: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        comments: {
          where: { deletedAt: null },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    // Check if user has access to the project
    const hasAccess = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: task.projectId,
          userId,
        },
      },
    });

    if (!hasAccess) {
      throw new ApiError(403, 'You do not have access to this task');
    }

    return task;
  }

  async updateTask(taskId, userId, updateData) {
    const task = await this.getTaskById(taskId, userId);

    // Check if user can edit
    const projectMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: task.projectId,
          userId,
        },
      },
    });

    if (projectMember.role === 'VIEWER') {
      throw new ApiError(403, 'Viewers cannot edit tasks');
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return updatedTask;
  }

  async deleteTask(taskId, userId) {
    const task = await this.getTaskById(taskId, userId);

    // Check if user can delete (Manager or task creator)
    const projectMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: task.projectId,
          userId,
        },
      },
    });

    if (projectMember.role === 'VIEWER' || (projectMember.role === 'CONTRIBUTOR' && task.createdById !== userId)) {
      throw new ApiError(403, 'You do not have permission to delete this task');
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return true;
  }

  async createComment(taskId, userId, content) {
    const task = await this.getTaskById(taskId, userId);

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return comment;
  }

  async updateComment(commentId, userId, content) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new ApiError(404, 'Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ApiError(403, 'You can only edit your own comments');
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return updatedComment;
  }

  async deleteComment(commentId, userId) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new ApiError(404, 'Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ApiError(403, 'You can only delete your own comments');
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });

    return true;
  }

  async getProjectTasks(projectId, userId, filters = {}) {
    // Check access
    const hasAccess = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (!hasAccess) {
      throw new ApiError(403, 'You do not have access to this project');
    }

    const where = { projectId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.assignedToId) {
      where.assignedToId = filters.assignedToId;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
    });

    return tasks;
  }
}

export default new TaskService();
