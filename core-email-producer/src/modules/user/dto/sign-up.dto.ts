import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { Transform } from "class-transformer";


export class SignUpDto {

    @IsNotEmpty()
    @IsString()
    userName: string;

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

