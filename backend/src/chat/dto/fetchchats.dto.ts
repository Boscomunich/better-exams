import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FetchChatsDto {
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer.' })
  @Min(1, { message: 'Page must be at least 1.' })
  page: number = 1;

  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer.' })
  @Min(1, { message: 'Limit must be at least 1.' })
  limit: number;

  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'Order must be either "asc" or "desc".' })
  order?: 'asc' | 'desc' = 'desc';
}
