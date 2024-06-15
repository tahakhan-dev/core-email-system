import { UserEntity } from "../entities/user.entity";
import { SignUpDto } from "../dto/sign-up.dto";
import { Injectable } from "@nestjs/common";


@Injectable()
export class UserMapper {

    createUserObj(signUpDto: SignUpDto, secreteKey: string, hasPassword: string): UserEntity { // mapper for create account object
        const UserObj = new UserEntity();
        UserObj.userName = signUpDto?.userName ?? null;
        UserObj.passwordHash = hasPassword ?? signUpDto?.password;
        UserObj.email = signUpDto?.email ?? null;
        UserObj.tokenSecretKey = secreteKey ?? null
        return UserObj
    }
}