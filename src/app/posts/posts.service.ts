import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Post } from './post.model';
import { stringify } from 'querystring';
import { Router } from '@angular/router';

@Injectable({providedIn: 'root'})
export class PostsService {
    private posts: Post[] = [];
    private postsUpdated = new Subject<Post[]>();

    constructor(private http: HttpClient,
                private router: Router) {}

    getPosts() {
        this.http.get<{ message: string, posts: any }>('http://localhost:3000/api/posts')
            .pipe(map((postData) => {
                return postData.posts.map(post => {
                    return {
                        title: post.title,
                        content: post.content,
                        id: post._id
                    };
                });
            }))
            .subscribe(
                res => {
                    this.posts = res;
                    this.postsUpdated.next([...this.posts]);
                },
                err => {
                    console.log(err);
                }
            );
    }

    getPostUpdateListener() {
        return this.postsUpdated.asObservable();
    }

    getPost(id: string) {
        return this.http.get<{_id: string, title: string, content: string}>(`http://localhost:3000/api/posts/${id}`);
    }

    addPost(title: string, content: string) {
        const post: Post = {id: null, title, content};
        this.http.post<{ message: string, postId: string }>('http://localhost:3000/api/posts', post)
            .subscribe(
                res => {
                    const postId = res.postId;
                    post.id = postId;
                    this.posts.push(post)
                    this.postsUpdated.next([...this.posts]);
                    this.router.navigate(['/']);
                },
                err => {
                    console.log(err);
                }
            );
    }

    updatePost(id: string, title: string, content: string) {
        const post: Post = { id, title, content };
        this.http.put(`http://localhost:3000/api/posts/${id}`, post)
            .subscribe(response => {
                const updatedPosts = [...this.posts];
                const oldPostIndex = updatedPosts.findIndex(p => p.id === id);
                updatedPosts[oldPostIndex] = post;
                this.posts = updatedPosts;
                this.postsUpdated.next([...this.posts]);
                this.router.navigate(['/']);
            });
    }

    deletePost(postId: string) {
        this.http.delete(`http://localhost:3000/api/posts/${postId}`)
            .subscribe(() => {
                this.posts = this.posts.filter(post => post.id !== postId);
                this.postsUpdated.next([...this.posts]);
            });
    }
}