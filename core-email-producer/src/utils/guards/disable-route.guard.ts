import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class DisableRouteGuard implements CanActivate {
    private isRouteEnabled = false; // Set this flag to enable or disable the route

    canActivate(context: ExecutionContext): boolean {
        return this.isRouteEnabled;
    }
}