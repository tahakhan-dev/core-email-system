export interface IHealthCheck {
    microServiceId: string;
    isActive: boolean;
    checkedOn: Date;
}
