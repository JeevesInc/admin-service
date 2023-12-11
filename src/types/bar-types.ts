import { IsNumber, IsOptional, IsString } from 'class-validator';

export class BarReqBody {
  @IsString()
  stringInput!: string;
  @IsOptional()
  @IsNumber()
  numberInput!: number;
}
export class BarResBody {
  @IsString()
  stringInput!: string;
  @IsOptional()
  @IsString()
  numberInput!: number;
}

export interface IBarGetResultRequestData {
  stringInput: string;
  numberInput: number;
}

export interface IBarResult {
  stringOutput: string;
  numberOutput: number;
}
