import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Content } from './models/content.model';
import { CreateContentDto, UpdateContentDto } from './dto/create-content.dto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'nestjs-prisma';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class ContentService {
  private s3: S3Client;

  constructor(
    private prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.s3 = new S3Client({
      region: this.config.get<string>('AWS_REGION'),
      endpoint: this.config.get<string>('S3_ENDPOINT'),
      credentials: {
        accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.config.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
      forcePathStyle: true,
    });
  }

  async uploadContentFile(file: Express.Multer.File): Promise<string> {
    const fileKey = `${uuidv4()}-${file.originalname}`;

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.config.get<string>('S3_BUCKET_NAME'),
          Key: fileKey,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read',
        }),
      );

      return `https://${this.config.get<string>('S3_BUCKET_NAME')}.${
        this.config.get<string>('S3_ENDPOINT').split('://')[1]
      }/${fileKey}`;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error('File upload failed');
    }
  }

  async createContent(
    createContentDto: CreateContentDto,
    file: Express.Multer.File,
  ): Promise<Content> {
    const {
      title,
      description,
      type,
      userExperiencePointsMin,
      userExperiencePointsMax,
      tags,
      categories,
      createdById,
    } = createContentDto;

    const createdByUser = await this.prisma.user.findUnique({
      where: { id: createdById },
    });

    if (!createdByUser) {
      throw new Error('User not found');
    }

    const parsedTags = tags ? JSON.parse(tags) : [];

    // Determine directory names based on the presence and titles of categories and tags
    const categoryDir = categories && categories.length > 0 ? categories[0].title : 'noCategory';
    const tagDir = parsedTags.length > 0 ? parsedTags[0] : 'noTag';

    // Construct the directory path
    const fileDirectory = `${categoryDir}/${tagDir}`;

    // Create a unique file key based on the directory structure
    const fileKey = file
      ? `${fileDirectory}/${uuidv4()}-${file.originalname}`
      : null;

    let fileUrl = null;

    if (file) {
      try {
        // Upload the file to S3
        await this.s3.send(
          new PutObjectCommand({
            Bucket: this.config.get<string>('S3_BUCKET_NAME'),
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read',
          }),
        );

        // Construct the file URL
        fileUrl = `https://${this.config.get<string>('S3_BUCKET_NAME')}.${
          this.config.get<string>('S3_ENDPOINT').split('://')[1]
        }/${fileKey}`;
      } catch (error) {
        console.error('Error uploading file to S3:', error);
        throw new Error('File upload failed');
      }
    }

    // Determine where the file should be stored based on content type
    let mediaUrlField = null;
    if (type === 'IMAGE') mediaUrlField = { imageURL: fileUrl };
    if (type === 'VIDEO') mediaUrlField = { videoURL: fileUrl };
    if (type === 'AUDIO') mediaUrlField = { audioURL: fileUrl };

    try {
      // Save the content in the database
      const newContent = await this.prisma.content.create({
        data: {
          title,
          description: description ?? '',
          type,
          userExperiencePointsMin: userExperiencePointsMin
            ? +userExperiencePointsMin
            : null,
          userExperiencePointsMax: userExperiencePointsMax
            ? +userExperiencePointsMax
            : null,
          tags: JSON.parse(tags) || [],
          ...mediaUrlField,
          categories: {
            connect: categories
              ? categories?.map((category) => ({ id: category.id }))
              : [],
          },
          categoryRequirements: {
            create: categories
              ? categories.map((category) => ({
                  category: { connect: { id: category.id } },
                  minLevel: category.min,
                  maxLevel: category.max,
                }))
              : [],
          },
          createdBy: { connect: { id: createdById } },
        },
        include: {
          createdBy: true,
        },
      });

      return newContent;
    } catch (error) {
      console.error('Error creating content in database:', error);
      throw new Error('Content creation failed');
    }
  }

  async findAll(): Promise<Content[]> {
    return this.prisma.content.findMany({
      include: {
        createdBy: true,
        categoryRequirements: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async findOne(id: string): Promise<Content> {
    return this.prisma.content.findUnique({
      where: { id },
      include: {
        createdBy: true,
      },
    });
  }

  async update(
    id: string,
    updateContentDto: UpdateContentDto,
    file?: Express.Multer.File,
  ): Promise<Content> {
    const {
      title,
      description,
      type,
      userExperiencePointsMin,
      userExperiencePointsMax,
      tags,
      categories,
    } = updateContentDto;

    // Fetch the existing content to check for changes
    const existingContent = await this.prisma.content.findUnique({
      where: { id },
    });

    if (!existingContent) {
      throw new Error('Content not found');
    }

    // Handle file upload if there's a new file
    let fileUrl = null;
    if (file) {
      const fileKey = `${uuidv4()}-${file.originalname}`;
      try {
        await this.s3.send(
          new PutObjectCommand({
            Bucket: this.config.get<string>('S3_BUCKET_NAME'),
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read',
          }),
        );

        fileUrl = `https://${this.config.get<string>('S3_BUCKET_NAME')}.${
          this.config.get<string>('S3_ENDPOINT').split('://')[1]
        }/${fileKey}`;
      } catch (error) {
        console.error('Error uploading file to S3:', error);
        throw new Error('File upload failed');
      }
    }

    // Determine which media field to update based on content type
    let mediaUrlField = {};
    if (fileUrl) {
      mediaUrlField = this.getMediaUrlField(type, fileUrl);
    }

    try {
      // Update the content in the database
      const updatedContent = await this.prisma.content.update({
        where: { id },
        data: {
          title: title || existingContent.title,
          description: description || existingContent.description,
          type: type || existingContent.type,
          userExperiencePointsMin:
            +userExperiencePointsMin || existingContent.userExperiencePointsMin,
          userExperiencePointsMax:
            +userExperiencePointsMax || existingContent.userExperiencePointsMax,
          tags: JSON.parse(tags) || existingContent.tags,
          ...mediaUrlField,
          ...(Array.isArray(categories) && {
            categories: {
              set: categories.map((category) => ({ id: category.id })),
            },
            categoryRequirements: {
              deleteMany: {},
              create: categories.map((category) => ({
                category: { connect: { id: category.id } },
                minLevel: category.min,
                maxLevel: category.max,
              })),
            },
          }),
        },
        include: {
          createdBy: true,
        },
      });

      return updatedContent;
    } catch (error) {
      console.error('Error updating content in the database:', error);
      throw new Error('Content update failed');
    }
  }

  async remove(id: string): Promise<void> {
    await this.prisma.content.delete({
      where: { id },
    });
  }

  private getMediaUrlField(type: string, fileUrl: string | null) {
    if (type === 'IMAGE') return { imageURL: fileUrl };
    if (type === 'VIDEO') return { videoURL: fileUrl };
    if (type === 'AUDIO') return { audioURL: fileUrl };
    return {};
  }

  private getFileKeyFromUrl(content: Content): string | null {
    if (content.imageURL) return content.imageURL.split('/').pop();
    if (content.videoURL) return content.videoURL.split('/').pop();
    if (content.audioURL) return content.audioURL.split('/').pop();
    return null;
  }
}
