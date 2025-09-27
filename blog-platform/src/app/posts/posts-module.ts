import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostsRoutingModule } from './posts-routing-module';
import { PostList } from './post-list/post-list';
import { PostDetail } from './post-detail/post-detail';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PostsRoutingModule,
    PostList,
    PostDetail
  ]
})
export class PostsModule { }
