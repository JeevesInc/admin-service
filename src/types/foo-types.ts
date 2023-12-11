import { IsNumber, IsString } from 'class-validator';

export class FooResBody {
  @IsString()
  name!: string;
  @IsNumber()
  numericCode!: number;
  @IsString()
  alpha2Code!: string;
}

export class FooReqBody {
  @IsString()
  stringInput!: string;
  @IsNumber()
  numberInput!: number;
}
export class GetFooResBody {
  @IsString()
  name!: string;
  @IsNumber()
  numericCode!: number;
  @IsString()
  alpha2Code!: string;
}
