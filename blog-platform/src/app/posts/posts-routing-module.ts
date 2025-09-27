import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostList } from './post-list/post-list';
import { PostDetail } from './post-detail/post-detail';

const routes: Routes = [
  { path: '', component: PostList },
  { 
    path: ':id', 
    component: PostDetail
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PostsRoutingModule { }
