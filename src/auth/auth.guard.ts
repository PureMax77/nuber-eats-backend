import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { AllowedRoles } from './role.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    // 데코레이터에서 입력한 @role
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );
    if (!roles) {
      return true; // request가 통과되어 그대로 진행
    }
    const gqlContext = GqlExecutionContext.create(context).getContext(); // http Context를 gql Context로 바꿔줌
    const user: User = gqlContext['user'];
    if (!user) {
      return false; // request 퉁과 안됨
    }
    // Any면 어떤사용자든 로그인 되어있으면 통과
    if (roles.includes('Any')) {
      return true;
    }
    console.log(user);
    return roles.includes(user.role); // 데코레이터로 받아온 role이 사용자의 role과 일치하는지 체크
  }
}
