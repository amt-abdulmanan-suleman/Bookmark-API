import {Test} from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { BookmarkDto, EditBookmark } from '../src/bookmark/dto';
describe('App e2e', () => {
  let app: INestApplication
  let prisma: PrismaService
  beforeAll(async()=>{ 
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({whitelist: true}));
    await app.init()
    await app.listen(3001)

    prisma = app.get(PrismaService)
    await prisma.cleanDb()
    pactum.request.setBaseUrl('http://localhost:3001')
  })
  afterAll(()=>{
    app.close()
  })

  describe('Auth', ()=>{
    const dto: AuthDto = {
      email: "sulemanabdulmanan@gmail.com",
      password: "AbdulManan",
      firstName: "Abdul",
      lastName: "Manan"
    }
    describe('Signup', ()=>{
      it("Should throw an exception if email is empty", ()=>{
        return pactum.spec().post('/auth/signup').withBody({
          password: dto.password
        }).expectStatus(400)
      })
      it("Should throw an exception if password is empty", ()=>{
        return pactum.spec().post('/auth/signup').withBody({
          email: dto.email
        }).expectStatus(400)
      })
      it("Should throw an exception if password and email are empty", ()=>{
        return pactum.spec().post('/auth/signup').withBody({}).expectStatus(400)
      })
      it("Should sign up", ()=>{
        return pactum.spec().post('/auth/signup').withBody(dto).expectStatus(201)
      })
    })
    describe('Signin', ()=>{
      it("Should throw an exception if email is empty", ()=>{
        return pactum.spec().post('/auth/signin').withBody({
          password: dto.password
        }).expectStatus(400)
      })
      it("Should throw an exception if password is empty", ()=>{
        return pactum.spec().post('/auth/signin').withBody({
          email: dto.email
        }).expectStatus(400)
      })
      it("Should throw an exception if password and email are empty", ()=>{
        return pactum.spec().post('/auth/signin').withBody({}).expectStatus(400)
      })
      it("Should sign in", ()=>{
        return pactum.spec().post('/auth/signin').withBody(dto).expectStatus(200).stores('userAt', 'access_token')
      })
    })
  })
  describe('User', ()=>{
    describe('Get me', ()=>{
      it("Should get me", ()=>{
        return pactum.spec().get('/users/profile').withHeaders({
          Authorization: "Bearer $S{userAt}"
        }).expectStatus(200)
      })
    })
    describe('Edit me', ()=>{
      it("Should update me", ()=>{
        const dto:EditUserDto = {
          firstName: "reduction"
        }
        return pactum.spec().patch('/users/profile').withHeaders({
          Authorization: "Bearer $S{userAt}"
        }).withBody(dto).expectStatus(200).expectBodyContains(dto.firstName)
      })
    })
  })
  describe('Bookmark', ()=>{
    describe('Create bookmark', ()=>{
      it("Should create bookmark", ()=>{
        const dto: BookmarkDto = {
          title: "Youtube",
          description: "youtube java tutorial",
          link: "www.login.com"
        }
        return pactum.spec().post('/bookmarks').withHeaders({
          Authorization: "Bearer $S{userAt}"
        }).withBody(dto).expectStatus(201).stores('id', 'id');
      })
    })
    describe('Get bookmarks', ()=>{
      it("Should get bookmark", ()=>{
        return pactum.spec().get('/bookmarks/mine').withHeaders({
          Authorization: "Bearer $S{userAt}"
        }).expectStatus(200);
      })
    })
    describe('Get bookmark by Id', ()=>{
      it("Should get bookmark by Id", ()=>{
        return pactum.spec().get('/bookmarks/$S{id}').withHeaders({
          Authorization: "Bearer $S{userAt}"
        }).expectStatus(200);
      })
    })
    describe('Edit bookmark by Id', ()=>{
      const dto:EditBookmark = {
        title: "pandas",
        link: "fried",
        description: ''
      }
      it("Should edit bookmark by Id", ()=>{
        return pactum.spec().patch('/bookmarks/$S{id}').withHeaders({
          Authorization: "Bearer $S{userAt}"
        }).withBody(dto).expectStatus(200);
      })
    })
    describe('Delete bookmark by Id ', ()=>{
      it("Should edit bookmark by Id", ()=>{
        return pactum.spec().delete('/bookmarks/$S{id}').withHeaders({
          Authorization: "Bearer $S{userAt}"
        }).expectStatus(200);
      })
    })
  })
})