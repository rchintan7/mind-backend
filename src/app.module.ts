import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule, loggingMiddleware } from 'nestjs-prisma';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ArchivementModule } from './archivements/archivements.module';
import { ContentModule } from './content/content.module';
import config from './common/configs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { TagsModule } from './tags/tags.module';
import { TaskModule } from './tasks/task.module';
import { CategoriesModule } from './categories/categories.module';
import { TaskFlowModule } from './taskFlows/taskflow.module';
import { BusinessRulesModule } from './businessRules/businessRules.module';
import { NotificationModule } from './notifications/notification.module';
import { MoodsModule } from './moods/moods.module';
import { DiariesModule } from './diaries/diaries.module';
import { ChatModule } from './chat/chat.module';
import { UserCategoriesModule } from './userCategories/userCategories.module';
import { UserLevelModule } from './userLevel/userLevel.module';
import { GoalsModule } from './goals/goals.module';
import { DiaryQuestionsModule } from './diaryQuestions/diaryQuestions.module';
import { FeedbackModule } from './feedback/feedback.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        middlewares: [
          // configure your prisma middleware
          loggingMiddleware({
            logger: new Logger('PrismaMiddleware'),
            logLevel: 'log',
          }),
        ],
      },
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
    }),

    AuthModule,
    UsersModule,
    ArchivementModule,
    ContentModule,
    TagsModule,
    TaskModule,
    TaskFlowModule,
    CategoriesModule,
    BusinessRulesModule,
    NotificationModule,
    MoodsModule,
    DiariesModule,
    ChatModule,
    UserCategoriesModule,
    UserLevelModule,
    GoalsModule,
    DiaryQuestionsModule,
    FeedbackModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
