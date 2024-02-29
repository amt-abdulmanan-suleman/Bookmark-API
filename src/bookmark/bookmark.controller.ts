import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { GetUser } from '../auth/decorator';
import { BookmarkDto } from './dto';
import { JwtGuard } from '../auth/guard';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
    constructor(private bookmarkServices: BookmarkService){}
    @Post("")
    createBookmark( @GetUser('id') userId: number,
    @Body() dto: BookmarkDto,){
        return this.bookmarkServices.addBookmark(userId, dto)
    }
    @Get("/mine")
    fetchBookmarks(@GetUser('id') userId: number){
        return this.bookmarkServices.getBookmarks(userId)
    }
    @Get(":id")
    fetchBookmarksById(@GetUser("id") userId: number, @Param('id', ParseIntPipe) id: number){
        return this.bookmarkServices.getBookmarksById(userId,id)
    }

    @Patch(":id")
    editBookmarksById(@GetUser("id") userId: number, @Param('id', ParseIntPipe) id: number,@Body() dto: BookmarkDto){
        return this.bookmarkServices.updateBookmarksById(userId,id, dto)
    }

    @Delete(':id')
    deleteBookmarks(@GetUser("id") userId: number, @Param('id', ParseIntPipe) id: number){
        return this.bookmarkServices.deleteBookmarks(userId, id)
    }
}
