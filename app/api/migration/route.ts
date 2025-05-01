import { prisma } from "@/lib/prisma/client";
import { getUsers } from "@/lib/prisma/queries";
import { DbUser } from "@/lib/prisma/types";
import { NextResponse } from "next/server";

const BATCH_SIZE = 1000;

export const POST = async () => {
  try {
    // make a cycle through the database to get all users
    // and insert them into a new table

    let users: DbUser[] = await getUsers(BATCH_SIZE, 5000);
    let cyclesCount = 5;
    // let generatedStatistics = 1000;
    while (users.length > 0) {
      // Process the users here
      // For example, you can log them or perform some operations
      console.log(
        `Cycle ${cyclesCount + 1} - Processing ${users.length} users...`
      );
      console.log(`first user of the batch: ${users[0].fid}`);

      // const inserts = [];
      const userStatisticsToAdd: {
        fid: number;
        mode: string;
        xp: number;
        coins: number;
        expansions: number;
      }[] = users.map((user) => ({
        fid: user.fid,
        mode: "classic",
        xp: user.xp,
        coins: user.coins,
        expansions: user.expansions,
      }));
      // for (const user of users) {
      // Perform your migration logic here
      // inserts.push(
      //   prisma.user_statistic.create({
      //     data: {
      //       fid: user.fid,
      //       mode: "classic",
      //       xp: user.xp,
      //       coins: user.coins,
      //       expansions: user.expansions,
      //     },
      //   })
      // );
      // generatedStatistics++;
      // }

      console.log(`inserting ${userStatisticsToAdd.length} user statistics...`);
      await prisma.user_statistic.createMany({
        data: userStatisticsToAdd,
      });
      // await prisma.$transaction(inserts);
      console.log(
        `inserted ${userStatisticsToAdd.length} user statistics successfully`
      );

      // Fetch the next batch of users
      const offset = users.length * (cyclesCount + 1);
      users = await getUsers(BATCH_SIZE, offset);
      cyclesCount++;
    }

    return NextResponse.json({
      message: "Users migrated successfully",
      cyclesCount,
      // generatedStatistics,
    });
  } catch (error) {
    console.error("Error in migration route:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
