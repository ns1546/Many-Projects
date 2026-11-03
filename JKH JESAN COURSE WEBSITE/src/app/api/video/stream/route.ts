import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");

    if (!lessonId) {
      return new NextResponse("Lesson ID is required", { status: 400 });
    }

    // 1. Session verification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. User lookup
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { enrollments: true },
    });

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 3. Lesson lookup
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId, isDeleted: false },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson || !lesson.videoUrl) {
      return new NextResponse("Video not found", { status: 404 });
    }

    // 4. Enrollment & Authorization check
    const isEnrolled = user.enrollments.some(
      (e: any) => e.courseId === lesson.module.courseId
    );
    const isAdmin = user.role === "ADMIN";

    if (!isEnrolled && !isAdmin && !lesson.isFree) {
      return new NextResponse("Forbidden: Course enrollment required", {
        status: 403,
      });
    }

    // If it's a YouTube or Vimeo URL, return JSON metadata
    const rawUrl = lesson.videoUrl.trim();
    const isEmbed =
      rawUrl.includes("youtube.com") ||
      rawUrl.includes("youtu.be") ||
      rawUrl.includes("vimeo.com");

    if (isEmbed) {
      return NextResponse.json({
        type: "embed",
        url: rawUrl,
      });
    }

    // 5. Proxy Stream with Range support for MP4 / direct video
    const range = request.headers.get("range");
    const fetchHeaders: Record<string, string> = {
      "User-Agent": request.headers.get("user-agent") || "EvoRiseSecurePlayer",
    };

    if (range) {
      fetchHeaders["Range"] = range;
    }

    const upstreamRes = await fetch(rawUrl, {
      headers: fetchHeaders,
    });

    if (!upstreamRes.ok && upstreamRes.status !== 206) {
      return new NextResponse("Failed to load video stream", {
        status: upstreamRes.status,
      });
    }

    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", upstreamRes.headers.get("content-type") || "video/mp4");
    responseHeaders.set("Accept-Ranges", "bytes");
    responseHeaders.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
    responseHeaders.set("Pragma", "no-cache");
    responseHeaders.set("Expires", "0");
    responseHeaders.set("X-Content-Type-Options", "nosniff");
    responseHeaders.set("Content-Disposition", "inline");

    const contentRange = upstreamRes.headers.get("content-range");
    if (contentRange) {
      responseHeaders.set("Content-Range", contentRange);
    }

    const contentLength = upstreamRes.headers.get("content-length");
    if (contentLength) {
      responseHeaders.set("Content-Length", contentLength);
    }

    return new NextResponse(upstreamRes.body as any, {
      status: upstreamRes.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Video streaming error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
