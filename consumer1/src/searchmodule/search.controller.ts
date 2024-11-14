import { Controller, Get, Query, UseGuards, HttpException, HttpStatus , UseInterceptors} from '@nestjs/common';
import { SearchService } from './search.service';
// import { SetMetadata } from '@nestjs/common';
import { AuthGuard } from 'src/guard/auth.guard';
import { RolesGuard } from 'src/guard/role.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';

@UseInterceptors(CacheInterceptor)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('/multi-field-search')
 //@SetMetadata('roles', ['admin']) // Only users with the 'admin' role can access this route
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard)  
  async multiFieldSearch(@Query('q') query: string) {
    try {
      const results = await this.searchService.multi_field_search(query);
      return results; // Returns both users and orders
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
 
  @Get('/fuzzy-search')
 //@SetMetadata('roles', ['admin']) // Only users with the 'admin' role can access this route
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard)  
  async fuzzysearch(@Query('q') query: string) {
    try {
      const results = await this.searchService.fuzzy_search(query);
      return results; // Returns both users and orders
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
}
