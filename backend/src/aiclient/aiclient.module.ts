import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

const AI_CLIENT_CONFIG = ClientsModule.register([
  {
    name: 'AI_SERVICE',
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: 8877,
    },
  },
]);

@Module({
  imports: [AI_CLIENT_CONFIG],
  exports: [AI_CLIENT_CONFIG],
})
export class AiClientModule {}
