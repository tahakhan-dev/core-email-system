import { SetMetadata } from "@nestjs/common";

export const hasRoles = (...hasRoles: string[]) => { // its a higher-order function that takes multiple strings (roles) as arguments using the spread operator
    return SetMetadata('roles', hasRoles)
} 