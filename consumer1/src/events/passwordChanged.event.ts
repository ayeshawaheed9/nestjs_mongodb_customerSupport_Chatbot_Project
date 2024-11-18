export class PasswordChangedEvent {
  constructor(
    public readonly userId: string,
    public readonly timestamp: Date,
    public readonly ipAddress: string, 
  ) {}
}
