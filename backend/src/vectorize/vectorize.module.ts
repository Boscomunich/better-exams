import { Module } from '@nestjs/common';
import { VectorizeService } from './vectorize.service';
import { VectorizeController } from './vectorize.controller';
import { AiClientModule } from 'src/aiclient/aiclient.module';

@Module({
  imports: [AiClientModule],
  providers: [VectorizeService],
  controllers: [VectorizeController],
  exports: [VectorizeService],
})
export class VectorizeModule {}
