import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createBlogPost,
  getAllBlogPosts,
} from "@/lib/blog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function ensureAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return Boolean(session);
}

async function triggerFrontendRebuild() {
  const webhookUrl = process.env.FRONTEND_REBUILD_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "admin-panel", type: "blog-changed" }),
    });
  } catch (error) {
    console.error("Failed to trigger frontend rebuild:", error);
  }
}

export async function GET() {
  try {
    if (!(await ensureAdminSession())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    const posts = await getAllBlogPosts();

    return NextResponse.json(
      {
        success: true,
        posts: posts.map((post) => ({
          id: post._id.toString(),
          title: post.title,
          slug: post.slug,
          summary: post.summary,
          published: post.published,
          createdAt: post.createdAt.toISOString(),
        })),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch blog posts.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!(await ensureAdminSession())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 },
      );
    }

    const title =
      typeof body.title === "string" ? body.title.trim() : "";
    const slug =
      typeof body.slug === "string" ? body.slug.trim() : "";
    const summary =
      typeof body.summary === "string"
        ? body.summary.trim()
        : "";
    const content =
      typeof body.content === "string"
        ? body.content.trim()
        : "";

    if (!title || !slug || !summary || !content) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Title, slug, summary, and content are required.",
        },
        { status: 400 },
      );
    }

    const tags: string[] | undefined = Array.isArray(body.tags)
      ? (body.tags as string[])
          .map((tag) =>
            typeof tag === "string" ? tag.trim() : "",
          )
          .filter(Boolean)
      : typeof body.tags === "string"
        ? body.tags
            .split(",")
            .map((tag: string) => tag.trim())
            .filter(Boolean)
        : undefined;

    const created = await createBlogPost({
      title,
      slug,
      summary,
      content,
      tags,
      seoTitle:
        typeof body.seoTitle === "string"
          ? body.seoTitle.trim()
          : undefined,
      seoDescription:
        typeof body.seoDescription === "string"
          ? body.seoDescription.trim()
          : undefined,
      published:
        typeof body.published === "boolean"
          ? body.published
          : true,
    });

    await triggerFrontendRebuild();

    return NextResponse.json(
      {
        success: true,
        post: {
          id: created._id.toString(),
          title: created.title,
          slug: created.slug,
          summary: created.summary,
          published: created.published,
          createdAt: created.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating blog post:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create blog post.";
    return NextResponse.json(
      { success: false, message },
      { status: 500 },
    );
  }
}
