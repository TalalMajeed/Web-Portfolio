"use client";

import { useState } from "react";

type PostListItem = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  published: boolean;
  createdAt: string;
};

type Props = {
  initialPosts: PostListItem[];
};

export function AdminBlogManager({ initialPosts }: Props) {
  const [posts, setPosts] =
    useState<PostListItem[]>(initialPosts);
  const [activeId, setActiveId] = useState<string | null>(
    null,
  );
  const [formState, setFormState] = useState({
    title: "",
    slug: "",
    summary: "",
    content: "",
    tags: "",
    seoTitle: "",
    seoDescription: "",
    published: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setActiveId(null);
    setFormState({
      title: "",
      slug: "",
      summary: "",
      content: "",
      tags: "",
      seoTitle: "",
      seoDescription: "",
      published: true,
    });
    setError(null);
  }

  function startEdit(post: PostListItem) {
    setActiveId(post.id);
    void loadPost(post.id);
  }

  async function loadPost(id: string) {
    try {
      const res = await fetch(`/api/blog/${id}`);
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setError(
          data?.message ??
            "Failed to load post details.",
        );
        return;
      }

      const post = data.post as {
        title: string;
        slug: string;
        summary: string;
        content: string;
        tags: string[];
        seoTitle: string;
        seoDescription: string;
        published: boolean;
      };

      setFormState({
        title: post.title,
        slug: post.slug,
        summary: post.summary,
        content: post.content,
        tags: post.tags?.join(", ") ?? "",
        seoTitle: post.seoTitle ?? "",
        seoDescription: post.seoDescription ?? "",
        published: post.published,
      });
      setError(null);
    } catch (err) {
      console.error("Failed to load post:", err);
      setError("Unexpected error while loading post.");
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...formState,
        tags: formState.tags,
      };

      const endpoint = activeId
        ? `/api/blog/${activeId}`
        : "/api/blog";
      const method = activeId ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setError(
          data?.message ??
            "Failed to save blog post.",
        );
        setSaving(false);
        return;
      }

      const updated = data.post as PostListItem;

      setPosts((prev) => {
        const existingIndex = prev.findIndex(
          (p) => p.id === updated.id,
        );
        if (existingIndex === -1) {
          return [updated, ...prev];
        }
        const next = [...prev];
        next[existingIndex] = updated;
        return next;
      });

      resetForm();
    } catch (err) {
      console.error("Failed to save post:", err);
      setError("Unexpected error while saving post.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (
      !window.confirm(
        "Are you sure you want to delete this post?",
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/blog/${id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setError(
          data?.message ??
            "Failed to delete blog post.",
        );
        return;
      }

      setPosts((prev) =>
        prev.filter((post) => post.id !== id),
      );

      if (activeId === id) {
        resetForm();
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
      setError("Unexpected error while deleting post.");
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Posts
          </h2>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-100"
          >
            New post
          </button>
        </div>

        <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
          {posts.length === 0 ? (
            <p className="text-sm text-gray-500">
              No posts yet. Create your first article using
              the form on the right.
            </p>
          ) : (
            posts.map((post) => (
              <article
                key={post.id}
                className="flex items-start justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-gray-50"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-gray-900">
                    {post.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    /blog/{post.slug}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(
                      post.createdAt,
                    ).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      post.published
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {post.published ? "Published" : "Draft"}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(post)}
                      className="text-xs text-gray-600 hover:text-gray-900"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(post.id)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {activeId ? "Edit post" : "Create post"}
        </h2>

        <form
          className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          onSubmit={handleSubmit}
        >
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label
                htmlFor="title"
                className="block text-xs font-medium text-gray-700"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                value={formState.title}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    title: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="slug"
                className="block text-xs font-medium text-gray-700"
              >
                Slug
              </label>
              <input
                id="slug"
                type="text"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                value={formState.slug}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    slug: event.target.value,
                  }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="summary"
              className="block text-xs font-medium text-gray-700"
            >
              Summary
            </label>
            <textarea
              id="summary"
              rows={2}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              value={formState.summary}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  summary: event.target.value,
                }))
              }
              required
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="content"
              className="block text-xs font-medium text-gray-700"
            >
              Content (HTML)
            </label>
            <textarea
              id="content"
              rows={8}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              value={formState.content}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  content: event.target.value,
                }))
              }
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label
                htmlFor="tags"
                className="block text-xs font-medium text-gray-700"
              >
                Tags (comma separated)
              </label>
              <input
                id="tags"
                type="text"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                value={formState.tags}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    tags: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="published"
                className="block text-xs font-medium text-gray-700"
              >
                Status
              </label>
              <select
                id="published"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                value={formState.published ? "published" : "draft"}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    published:
                      event.target.value === "published",
                  }))
                }
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label
                htmlFor="seoTitle"
                className="block text-xs font-medium text-gray-700"
              >
                SEO title (optional)
              </label>
              <input
                id="seoTitle"
                type="text"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                value={formState.seoTitle}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    seoTitle: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="seoDescription"
                className="block text-xs font-medium text-gray-700"
              >
                SEO description (optional)
              </label>
              <input
                id="seoDescription"
                type="text"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                value={formState.seoDescription}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    seoDescription: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? activeId
                  ? "Saving..."
                  : "Creating..."
                : activeId
                  ? "Save changes"
                  : "Create post"}
            </button>
            <p className="text-xs text-gray-500">
              Saving will trigger a rebuild of the public
              frontend site (via webhook).
            </p>
          </div>
        </form>
      </section>
    </div>
  );
}

