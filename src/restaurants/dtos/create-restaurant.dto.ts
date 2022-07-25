import { InputType, OmitType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurants.entity';

@InputType()
export class CreateRestaurantDto extends OmitType(
  Restaurant,
  ['id'],
  InputType, // extends한 부모와 자녀의 타입이 다를 때 child의 타입명시
) {}
