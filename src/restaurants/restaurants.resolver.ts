import { Resolver, Query } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurants.entity';

@Resolver()
export class RestaurantsResolver {
  @Query(() => Restaurant)
  myRestaurant() {
    return true;
  }
}
