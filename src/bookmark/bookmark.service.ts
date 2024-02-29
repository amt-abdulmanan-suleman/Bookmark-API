import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookmarkDto } from './dto/bookmark.dto';

@Injectable()
export class BookmarkService {
    constructor(private prisma: PrismaService) {}

    private async getUser(userId: number) {
        const user = await this.prisma.user.findFirst({ where: { id: userId } });
        if (!user) {
            throw new ForbiddenException('User not found');
        }
        return user;
    }

    private async getBookmark(userId: number, bookmarkId: number) {
        const bookmark = await this.prisma.bookmark.findFirst({ where: { AND: [{ userId }, { id: bookmarkId }] } });
        if (!bookmark) {
            throw new NotFoundException('Bookmark not found');
        }
        return bookmark;
    }

    async addBookmark(userId: number, dto: BookmarkDto) {
        await this.getUser(userId);
        const bookmark = await this.prisma.bookmark.create({ data: { ...dto, userId } });
        return bookmark;
    }

    async getBookmarks(userId: number) {
        await this.getUser(userId);
        const bookmarks = await this.prisma.bookmark.findMany({ where: { userId } });
        return bookmarks;
    }

    async getBookmarksById(userId: number, bookmarkId: number) {
        await this.getUser(userId);
        const bookmark = await this.getBookmark(userId, bookmarkId);
        return bookmark;
    }

    async updateBookmarksById(userId: number, bookmarkId: number, dto: BookmarkDto) {
        await this.getUser(userId);
        await this.getBookmark(userId, bookmarkId);
        const updatedBookmark = await this.prisma.bookmark.update({ where: { id: bookmarkId }, data: { ...dto } });
        return updatedBookmark;
    }

    async deleteBookmarks(userId: number, bookmarkId: number) {
        await this.getUser(userId);
        await this.getBookmark(userId, bookmarkId);
        await this.prisma.bookmark.delete({ where: { id: bookmarkId } });
        return { msg: 'Deleted successfully' };
    }
}
