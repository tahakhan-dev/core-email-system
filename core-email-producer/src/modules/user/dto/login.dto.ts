import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { Transform } from "class-transformer";


export class LoginDto {

    @IsNotEmpty()
    @IsEmail()
    @IsString()
    @Transform(({ value }) => value.toLowerCase().toString().replace(/\s/g, '')) // Removing spaces and converting capital letters to lowercase.
    email: string;

    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value.toLowerCase().toString().replace(/\s/g, ''))
    password: string;

}

