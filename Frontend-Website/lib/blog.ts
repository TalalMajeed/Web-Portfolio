import type { Collection } from "mongodb";
import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";

export const BLOG_COLLECTION = "blog_posts";

export type BlogPostDocument = {
  _id: ObjectId;
  title: string;
  slug: string;
  summary: string;
  content: string;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  published: boolean;
  createdAt: Date;
  updatedAt?: Date;
};

async function getBlogCollection(): Promise<
  Collection<BlogPostDocument>
> {
  const db = await getDb();
  return db.collection<BlogPostDocument>(BLOG_COLLECTION);
}

export async function getPublishedBlogPosts(): Promise<
  BlogPostDocument[]
> {
  const collection = await getBlogCollection();
  return collection
    .find({ published: true })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getBlogPostBySlug(
  slug: string,
): Promise<BlogPostDocument | null> {
  const collection = await getBlogCollection();
  return collection.findOne({ slug, published: true });
}
