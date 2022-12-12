import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, Column, Entity } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { IsEmail, IsEnum } from 'class-validator';

// for database
enum UserRole {
  Client,
  Owner,
  Delivery,
}

// for graphql
registerEnumType(UserRole, { name: 'UserRole' });

@Entity() // for database
@InputType({ isAbstract: true }) // User를 기본적으로 아래 ObjectType으로 만들지만 다른곳에서 extend할때 InputType으로 복사도 허용해줌
@ObjectType() // for graphql
export class User extends CoreEntity {
  @Column() // 데이터 베이스에 동기화 되기 위한 부분
  @Field(() => String) // graphql 스키마를 위한 부분
  @IsEmail()
  email: string;

  @Column()
  @Field(() => String)
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  @Field(() => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  async checkPassword(aPassword: string): Promise<boolean> {
    try {
      const ok = await bcrypt.compare(aPassword, this.password);
      return ok;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
}
