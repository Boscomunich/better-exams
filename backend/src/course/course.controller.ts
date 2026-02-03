import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Delete,
  Param,
} from '@nestjs/common';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create.dto';
import { FetchCourseDto } from './dto/fetchcourse.dto';
import { DeleteCourseDto } from './dto/delete.dto';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  async fetchUserDocs(
    @Query() data: FetchCourseDto,
    @Session() session: UserSession,
  ) {
    return await this.courseService.fetchUserCourse(data, session.user.id);
  }

  @Get(':id')
  async getCourseById(@Param('id') id: string) {
    return await this.courseService.getCourseById(id);
  }

  @Post()
  createCourse(@Body() data: CreateCourseDto, @Session() session: UserSession) {
    return this.courseService.createCourse(data, session.user.id);
  }

  @Delete()
  async deleteCourse(@Body() data: DeleteCourseDto) {
    return await this.courseService.deleteCourse(data);
  }
}
