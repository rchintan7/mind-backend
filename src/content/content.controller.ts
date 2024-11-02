import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  Body,
  UploadedFile,
  UseInterceptors,
  Put,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContentService } from './content.service';
import { CreateContentDto, UpdateContentDto } from './dto/create-content.dto';
import { Content } from './models/content.model';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Express } from 'express';

@ApiTags('content')
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file directly to S3' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a file',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File successfully uploaded.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFileToS3(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string }> {
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }

    const fileUrl = await this.contentService.uploadContentFile(file);
    return { url: fileUrl };
  }

  @Post()
  @ApiOperation({ summary: 'Create content with file upload' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'The content object with the file to upload',
    type: CreateContentDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Content successfully created.',
    type: Content,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @UseInterceptors(FileInterceptor('file'))
  async createContent(
    @Body() createContentDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Content> {
    createContentDto = {
      ...createContentDto,
      categories: createContentDto?.categories
        ? JSON.parse(createContentDto.categories)
        : null,
    };
    return this.contentService.createContent(createContentDto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all content' })
  @ApiResponse({
    status: 200,
    description: 'Content successfully retrieved.',
    type: [Content],
  })
  async findAll(): Promise<Content[]> {
    return this.contentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve content by ID' })
  @ApiResponse({
    status: 200,
    description: 'Content successfully retrieved.',
    type: Content,
  })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async findOne(@Param('id') id: string): Promise<Content> {
    return this.contentService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update content by ID' })
  @ApiBody({ type: UpdateContentDto })
  @ApiResponse({
    status: 200,
    description: 'Content successfully updated.',
    type: Content,
  })
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id') id: string,
    @Body() updateContentDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Content> {
    if (
      updateContentDto.categories !== undefined &&
      updateContentDto.categories !== null
    ) {
      updateContentDto = {
        ...updateContentDto,
        categories: JSON.parse(updateContentDto.categories),
      };
    }
    return this.contentService.update(id, updateContentDto, file);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete content by ID' })
  @ApiResponse({
    status: 200,
    description: 'Content successfully deleted.',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.contentService.remove(id);
  }
}
