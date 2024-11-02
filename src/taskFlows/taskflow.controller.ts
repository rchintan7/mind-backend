import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Put,
} from '@nestjs/common';
import { TaskFlowService } from './taskflow.service';
import {
  CreateTaskFlowDto,
  UpdateTaskFlowDto,
} from './dto/create-taskflow.dto';

@Controller('task-flows')
export class TaskFlowController {
  constructor(private readonly taskFlowService: TaskFlowService) {}

  @Post()
  create(@Body() createTaskFlowDto) {
    return this.taskFlowService.create(createTaskFlowDto);
  }

  @Get()
  findAll() {
    return this.taskFlowService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taskFlowService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskFlowDto: UpdateTaskFlowDto,
  ) {
    return this.taskFlowService.update(id, updateTaskFlowDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taskFlowService.delete(id);
  }
}
