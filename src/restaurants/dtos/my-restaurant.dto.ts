import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/output.dto';
import { Restaurant } from '../entities/restaurants.entity';

@InputType()
export class MyRestaurantInput extends PickType(Restaurant, ['id']) {}

@ObjectType()
export class MyRestaurantOutput extends CoreOutput {
  @Field(() => Restaurant, { nullable: true })
  restaurant?: Restaurant;
}
