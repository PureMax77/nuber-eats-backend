import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const exists = await this.users.findOne({ where: { email } });
      if (exists) {
        // make error
        return {
          ok: false,
          error: '해당 email로 이미 가입한 사용자가 있습니다.',
        };
      }
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      const verification = await this.verifications.save(
        this.verifications.create({
          user,
        }),
      );
      this.mailService.sendVerificationEmail(user.email, verification.code);
      return { ok: true };
    } catch (e) {
      //make error
      return { ok: false, error: '계정을 만들 수 없습니다.' };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    // find the user with the email
    try {
      const user = await this.users.findOne({
        where: { email },
        select: ['id', 'password'], // 패스워드는 entity에서 select가 false라 데이터를 불러오려면 명시가 필요
      });
      if (!user) {
        return {
          ok: false,
          error: '해당 사용자를 찾을 수 없습니다.',
        };
      }
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: '비밀번호가 다릅니다.',
        };
      }
      const token = this.jwtService.sign(user.id);
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneOrFail({ where: { id } });

      return {
        ok: true,
        user,
      };
    } catch (e) {
      return {
        error: '사용자를 찾을 수 없습니다.',
        ok: false,
      };
    }
  }

  async editProfile(
    authUser: User,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      if (email) {
        authUser.email = email;
        authUser.verified = false;
        const verification = await this.verifications.save(
          this.verifications.create({ user: authUser }),
        );
        this.mailService.sendVerificationEmail(
          authUser.email,
          verification.code,
        );
      }
      if (password) authUser.password = password;
      await this.users.save(authUser);

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: '사용자 정보를 업데이트 할 수 없습니다.',
      };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verifications.findOne({
        where: { code },
        relations: ['user'],
      });
      if (verification) {
        verification.user.verified = true;
        await this.users.save(verification.user);
        await this.verifications.delete(verification.id);
        return {
          ok: true,
        };
      }
      throw new Error();
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error: 'Email을 인증할 수 없습니다.',
      };
    }
  }
}
