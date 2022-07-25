import { Field, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType() // for graphql
@Entity() // for database
export class Restaurant {
  @Field(() => Number) // graphql 스키마를 위한 부분
  @PrimaryGeneratedColumn() // 데이터 베이스에 동기화 되기 위한 부분
  id: number;

  @Field(() => String) // for graphql
  @Column() // for database
  @IsString()
  @Length(5)
  name: string;

  @Field(() => Boolean, { nullable: true })
  @Column({ default: true })
  @IsOptional()
  @IsBoolean()
  isVegan: boolean;

  @Field(() => String, { defaultValue: '판교' })
  @Column()
  @IsString()
  address: string;
}
