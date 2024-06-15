import { SubscriptionStatus } from "src/common/enums/status.enum";
import { IsEnum } from "class-validator";

export class CreateEmailSubscriptionDto {
    @IsEnum(SubscriptionStatus, {
        message: `status must be one of the following values: ${Object.values(SubscriptionStatus).join(', ')}`,
    })
    status: SubscriptionStatus;
}