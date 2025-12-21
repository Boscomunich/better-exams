import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { VectorizeFilesEvent } from './dto/vectorize.dto';
import { VectorizeService } from './vectorize.service';

@Controller('vectorize')
export class VectorizeController {
  constructor(private readonly vectorizeService: VectorizeService) {}

  @EventPattern('vectorize.files')
  async handleVectorize(@Payload() payload: VectorizeFilesEvent) {
    await this.vectorizeService.processFiles(payload);

    return true;
  }
}
