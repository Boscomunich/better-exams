import { Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { DocumentsService } from 'src/documents/documents.service';
import { DeleteCourseDto } from './dto/delete.dto';
import { FetchCourseDto } from './dto/fetchcourse.dto';

@Injectable()
export class CourseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly documentService: DocumentsService,
  ) {}

  async createCourse(data: CreateCourseDto, userId: string) {
    const course = await this.prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        userId,
      },
    });

    return {
      data: course,
      message: 'course has been created sucessfully',
    };
  }

  async fetchUserCourse(data: FetchCourseDto, userId: string) {
    const skip = (data.page - 1) * data.limit;

    const [courses, totalCount] = await Promise.all([
      this.prisma.course.findMany({
        where: { userId },
        include: {
          documents: true,
        },
        orderBy: {
          createdAt: data.order,
        },
        skip,
        take: data.limit,
      }),
      this.prisma.course.count({
        where: { userId },
      }),
    ]);

    const sanitizedCourses = courses.map((course) => ({
      ...course,
      documents: course.documents.map((doc) => ({
        ...doc,
        fileSize: doc.fileSize.toString(),
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
        vectorizedAt: doc.vectorizedAt?.toISOString(),
      })),
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    }));

    return {
      message: 'successful',
      data: sanitizedCourses,
      meta: {
        totalCount,
        currentPage: data.page,
        totalPages: Math.ceil(totalCount / data.limit),
        limit: data.limit,
      },
    };
  }

  async deleteCourse(data: DeleteCourseDto) {
    const course = await this.prisma.course.delete({
      where: {
        id: data.id,
      },
      include: {
        documents: {
          select: {
            id: true,
          },
        },
      },
    });

    if (data.willDeleteDocuments === true) {
      const documentIds = course.documents.map((doc) => doc.id);
      await this.documentService.deleteUserDocuments({ ids: documentIds });
    }

    return {
      data: course,
      message: `course ${course.title} has been deleted sucessfully`,
    };
  }

  async getCourseById(id: string) {
    const course = await this.prisma.course.findFirst({
      where: { id },
      include: {
        documents: true,
      },
    });

    if (!course) return null;

    const sanitizedDocuments = course.documents.map((doc) => ({
      ...doc,
      fileSize: doc.fileSize.toString(),
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
      vectorizedAt: doc.vectorizedAt?.toISOString(),
    }));

    const sanitizedCourse = {
      ...course,
      documents: sanitizedDocuments,
    };

    return sanitizedCourse;
  }
}
