import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import * as AWS from 'aws-sdk';

const BUCKET_NAME = 'kimchipark';

@Controller('uploads')
export class UploadsController {
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    AWS.config.update({
      credentials: {
        accessKeyId: process.env.S3_ACCESSKEY,
        secretAccessKey: process.env.S3_SECRET_ACCESSKEY,
      },
    });
    try {
      // 버켓 만들기용 코드
      // const upload = await new AWS.S3()
      //   .createBucket({ Bucket: 'kimchipuremax' })
      //   .promise();
      const objectName = `${Date.now() + file.originalname}`;
      await new AWS.S3()
        .putObject({
          Body: file.buffer,
          Bucket: BUCKET_NAME,
          Key: objectName,
          ACL: 'public-read',
        })
        .promise();
      const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${objectName}`;
      return { url };
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
