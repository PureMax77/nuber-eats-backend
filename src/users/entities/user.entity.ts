import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity } from 'typeorm';

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
  email: string;

  @Column()
  @Field(() => String)
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  @Field(() => UserRole)
  role: UserRole;
}
