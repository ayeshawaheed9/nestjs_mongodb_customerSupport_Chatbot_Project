import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityLog, ActivityLogSchema } from 'src/schemas/activity-log.schema';
import { LoggingService } from './logging.service';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: ActivityLog.name, schema: ActivityLogSchema }]), // Import the schema
  ],
  providers: [LoggingService],
  exports: [LoggingService], // Export the service for use in other modules
})
export class LoggingModule {}
