import { PrismaClient, type Role } from "@prisma/client";

import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const studentEmail = "student@example.com";
  const mentorEmail = "mentor@example.com";
  const password = "Password123!";

  const studentHash = await hashPassword(password);
  const mentorHash = await hashPassword(password);

  const student = await prisma.user.upsert({
    where: { email: studentEmail },
    update: {},
    create: {
      email: studentEmail,
      name: "Sample Student",
      passwordHash: studentHash,
      role: "STUDENT" satisfies Role,
    },
  });

  const mentor = await prisma.user.upsert({
    where: { email: mentorEmail },
    update: {},
    create: {
      email: mentorEmail,
      name: "Sample Mentor",
      passwordHash: mentorHash,
      role: "MENTOR" satisfies Role,
    },
  });

  const project = await prisma.project.upsert({
    where: { studentId_name: { studentId: student.id, name: "Portfolio Site" } },
    update: {},
    create: {
      name: "Portfolio Site",
      repoUrl: "https://github.com/example/portfolio-site",
      liveUrl: "https://example-portfolio.example.com",
      description:
        "A small Next.js portfolio demonstrating auth and project submissions.",
      status: "PENDING",
      studentId: student.id,
    },
  });

  // eslint-disable-next-line no-console
  console.log(`seeded student: ${student.email} (id=${student.id})`);
  // eslint-disable-next-line no-console
  console.log(`seeded mentor : ${mentor.email} (id=${mentor.id})`);
  // eslint-disable-next-line no-console
  console.log(
    `seeded project: ${project.name} (id=${project.id}) for student=${student.id}`,
  );
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
