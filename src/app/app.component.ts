import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlogService } from './services/blog.service';
import { Post, Comment } from './models/post.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  posts: Post[] = [];
  selectedPost: Post | null = null;
  loading = false;
  postError = '';
  postSuccess = '';
  commentError = '';

  formModel = {
    title: '',
    author: '',
    category: '' as '' | 'tech' | 'finance' | 'lifestyle',
    body: ''
  };

  commentModel = {
    commenter: '',
    text: ''
  };

  constructor(private blogService: BlogService) {}

  ngOnInit() {
    this.refreshPosts();
  }

  refreshPosts() {
    this.loading = true;
    this.blogService.getPosts().subscribe({
      next: (data) => {
        this.posts = data;
        this.loading = false;
      },
      error: (err) => {
        this.postError = err.error?.error || 'Failed to load posts';
        this.loading = false;
      }
    });
  }

  selectPost(post: Post) {
    this.selectedPost = post;
    this.formModel = {
      title: post.title,
      author: post.author,
      category: post.category,
      body: post.body
    };
    this.clearMessages();
  }

  newPost() {
    this.selectedPost = null;
    this.formModel = { title: '', author: '', category: '', body: '' };
    this.commentModel = { commenter: '', text: '' };
    this.clearMessages();
  }

  savePost() {
    this.clearMessages();
    const { title, author, category, body } = this.formModel;
    if (!title || !author || !category || !body) {
      this.postError = 'All fields are required';
      return;
    }
    if (title.length < 5) {
      this.postError = 'Title must be at least 5 characters';
      return;
    }
    if (author.length < 3) {
      this.postError = 'Author must be at least 3 characters';
      return;
    }
    if (body.length < 50) {
      this.postError = 'Body must be at least 50 characters';
      return;
    }

    if (this.selectedPost) {
      this.blogService.updatePost(this.selectedPost._id!, { title, author, category, body }).subscribe({
        next: (updated) => {
          this.selectedPost = updated;
          this.posts = this.posts.map(p => p._id === updated._id ? updated : p);
          this.postSuccess = 'Post updated successfully';
        },
        error: (err) => {
          this.postError = err.error?.error || 'Failed to update post';
        }
      });
    } else {
      this.blogService.createPost({ title, author, category, body }).subscribe({
        next: (created) => {
          this.posts = [created, ...this.posts];
          this.postSuccess = 'Post created successfully';
          this.selectPost(created);
        },
        error: (err) => {
          this.postError = err.error?.error || 'Failed to create post';
        }
      });
    }
  }

  deletePost() {
    if (!this.selectedPost?._id) return;
    this.clearMessages();
    this.blogService.deletePost(this.selectedPost._id).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p._id !== this.selectedPost!._id);
        this.newPost();
        this.postSuccess = 'Post deleted successfully';
      },
      error: (err) => {
        this.postError = err.error?.error || 'Failed to delete post';
      }
    });
  }

  addComment() {
    if (!this.selectedPost?._id) return;
    this.commentError = '';
    const { commenter, text } = this.commentModel;
    if (!commenter || !text) {
      this.commentError = 'Name and comment are required';
      return;
    }
    if (commenter.length < 3) {
      this.commentError = 'Name must be at least 3 characters';
      return;
    }
    if (text.length < 10) {
      this.commentError = 'Comment must be at least 10 characters';
      return;
    }

    this.blogService.addComment(this.selectedPost._id, commenter, text).subscribe({
      next: (updated) => {
        this.selectedPost = updated;
        this.commentModel = { commenter: '', text: '' };
      },
      error: (err) => {
        this.commentError = err.error?.error || 'Failed to add comment';
      }
    });
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString();
  }

  get categoryLabel(): string {
    const labels: Record<string, string> = {
      tech: 'Tech',
      finance: 'Finance',
      lifestyle: 'Lifestyle'
    };
    return this.selectedPost ? labels[this.selectedPost.category] || '' : '';
  }

  private clearMessages() {
    this.postError = '';
    this.postSuccess = '';
    this.commentError = '';
  }
}
