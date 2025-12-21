import { Prisma } from '@prisma/client';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  RequestTimeoutException,
  ServiceUnavailableException,
  InternalServerErrorException,
} from '@nestjs/common';

export function handlePrismaError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handleKnownRequestError(error);
  }

  throw new InternalServerErrorException('Database operation failed');
}

function handleKnownRequestError(error: Prisma.PrismaClientKnownRequestError) {
  const { code, meta } = error;

  switch (code) {
    // UNIQUE CONSTRAINT
    case 'P2002': {
      const fields = Array.isArray(meta?.target) ? meta?.target : ['field'];
      const fieldNames = fields.join(', ');

      return new ConflictException(`${fieldNames} already exists`);
    }

    // RECORD NOT FOUND
    case 'P2025': {
      const model =
        typeof meta?.modelName === 'string' ? meta.modelName : 'Record';

      return new NotFoundException(`${model} not found`);
    }

    // FOREIGN KEY
    case 'P2003': {
      const field =
        typeof meta?.field_name === 'string' ? meta.field_name : 'foreign key';

      return new BadRequestException(`Invalid foreign key reference: ${field}`);
    }

    // REQUIRED FIELD NULL
    case 'P2011': {
      const constraint =
        typeof meta?.constraint === 'string' ? meta.constraint : 'field';

      return new BadRequestException(`${constraint} is required`);
    }

    // CHECK CONSTRAINT
    case 'P2012': {
      const constraint =
        typeof meta?.constraint === 'string' ? meta.constraint : 'field';

      return new BadRequestException(`Invalid value for ${constraint}`);
    }

    // QUERY TIMEOUT
    case 'P2028':
      return new RequestTimeoutException('Database query timeout');

    // CONNECTION LIMIT
    case 'P2037':
      return new ServiceUnavailableException(
        'Database connection limit exceeded',
      );

    // DEFAULT
    default:
      return new BadRequestException(`Prisma error: ${code}`);
  }
}
