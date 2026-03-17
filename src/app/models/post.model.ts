export interface Comment {
  _id?: string;
  commenter: string;
  text: string;
  createdAt?: string;
}

export interface Post {
  _id?: string;
  title: string;
  author: string;
  category: 'tech' | 'finance' | 'lifestyle';
  body: string;
  comments?: Comment[];
  createdAt?: string;
  updatedAt?: string;
}
