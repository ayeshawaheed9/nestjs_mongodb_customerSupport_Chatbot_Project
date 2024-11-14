import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivityLog, ActivityLogDocument} from 'src/schemas/activity-log.schema';
@Injectable()
export class LoggingService {
  constructor(
    @InjectModel(ActivityLog.name) private activityLogModel: Model<ActivityLogDocument>,
  ) {}

  async logActivity(userId: string, action: string, details: string): Promise<ActivityLog> {
    const log = new this.activityLogModel({
      userId,
      action,
      details,
      timestamp: new Date(),
    });
    
    return log.save();  // Store the log in MongoDB
  }
}
