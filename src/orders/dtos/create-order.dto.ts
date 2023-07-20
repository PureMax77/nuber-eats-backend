import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/output.dto';
import { DishOption } from 'src/restaurants/entities/dish.entity';
import { OrderItemOption } from '../entities/order-item.entity';
import { Order } from '../entities/order.entity';

@InputType()
class CreateOrderItemInput {
  @Field(() => Number)
  dishId: number;

  @Field(() => [OrderItemOption], { nullable: true })
  options?: OrderItemOption[];
}

@InputType()
export class CreateOrderInput {
  @Field(() => Number)
  restaurantId: number;

  @Field(() => [CreateOrderItemInput])
  items: CreateOrderItemInput[];
}

@ObjectType()
export class CreateOrderOutput extends CoreOutput {
  @Field(() => Number, { nullable: true })
  orderId?: number;
}
