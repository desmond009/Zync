import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create demo users
  const passwordHash = await bcrypt.hash('Password123!', 12);

  const user1 = await prisma.user.upsert({
    where: { email: 'admin@zync.app' },
    update: {},
    create: {
      email: 'admin@zync.app',
      password: passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      isEmailVerified: true,
      role: 'ADMIN',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'john@zync.app' },
    update: {},
    create: {
      email: 'john@zync.app',
      password: passwordHash,
      firstName: 'John',
      lastName: 'Doe',
      isEmailVerified: true,
      role: 'USER',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'jane@zync.app' },
    update: {},
    create: {
      email: 'jane@zync.app',
      password: passwordHash,
      firstName: 'Jane',
      lastName: 'Smith',
      isEmailVerified: true,
      role: 'USER',
    },
  });

  console.log('✅ Users created');

  // Create a demo team
  const team = await prisma.team.create({
    data: {
      name: 'Engineering Team',
      description: 'Main engineering team for product development',
      ownerId: user1.id,
      members: {
        create: [
          { userId: user1.id, role: 'OWNER' },
          { userId: user2.id, role: 'ADMIN' },
          { userId: user3.id, role: 'MEMBER' },
        ],
      },
    },
  });

  console.log('✅ Team created');

  // Create demo projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Zync MVP',
      description: 'Building the minimum viable product',
      teamId: team.id,
      status: 'ACTIVE',
      color: '#3B82F6',
      members: {
        create: [
          { userId: user1.id, role: 'MANAGER' },
          { userId: user2.id, role: 'CONTRIBUTOR' },
          { userId: user3.id, role: 'CONTRIBUTOR' },
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Marketing Campaign',
      description: 'Q1 marketing initiatives',
      teamId: team.id,
      status: 'ACTIVE',
      color: '#10B981',
      members: {
        create: [
          { userId: user1.id, role: 'VIEWER' },
          { userId: user3.id, role: 'MANAGER' },
        ],
      },
    },
  });

  console.log('✅ Projects created');

  // Create demo tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Setup authentication system',
        description: 'Implement JWT-based authentication with refresh tokens',
        projectId: project1.id,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        createdById: user1.id,
        assignedToId: user2.id,
        position: 0,
      },
      {
        title: 'Design database schema',
        description: 'Create Prisma schema for all models',
        projectId: project1.id,
        status: 'DONE',
        priority: 'HIGH',
        createdById: user1.id,
        assignedToId: user1.id,
        position: 1,
      },
      {
        title: 'Implement real-time chat',
        description: 'Setup Socket.io for project chat functionality',
        projectId: project1.id,
        status: 'TODO',
        priority: 'MEDIUM',
        createdById: user1.id,
        assignedToId: user3.id,
        position: 2,
      },
      {
        title: 'Create landing page',
        description: 'Design and develop the marketing landing page',
        projectId: project2.id,
        status: 'IN_REVIEW',
        priority: 'URGENT',
        createdById: user3.id,
        assignedToId: user3.id,
        position: 0,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('✅ Tasks created');

  // Create demo notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: user2.id,
        type: 'TASK_ASSIGNED',
        content: {
          taskId: 'task-id',
          taskTitle: 'Setup authentication system',
          assignedBy: 'Admin User',
        },
        isRead: false,
      },
      {
        userId: user3.id,
        type: 'TASK_ASSIGNED',
        content: {
          taskId: 'task-id',
          taskTitle: 'Implement real-time chat',
          assignedBy: 'Admin User',
        },
        isRead: false,
      },
    ],
  });

  console.log('✅ Notifications created');
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
