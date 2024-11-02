import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // await prisma.user.deleteMany();

  console.log('Seeding not implemented yet');

  // const user1 = await prisma.user.create({
  //   data: {
  //     Email: 'lisa@simpson.com',
  //     Firstname: 'Lisa',
  //     Lastname: 'Simpson',
  //     Password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // secret42
  //     UserRole: 'USER',
  //   },
  // });
  // const user2 = await prisma.user.create({
  //   data: {
  //     Email: 'bart@simpson.com',
  //     Firstname: 'Bart',
  //     Lastname: 'Simpson',
  //     UserRole: 'ADMIN',
  //     Password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // secret42
  //   },
  // });

  // console.log({ user1, user2 });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
