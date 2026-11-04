import { prisma as db } from "@/lib/prisma";

// ── In-Memory Fast Cache with TTL ──────────────────────────────────────────
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();

function getFromCache<T>(key: string, ttlMs: number): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > ttlMs) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setToCache<T>(key: string, data: T): void {
  memoryCache.set(key, { data, timestamp: Date.now() });
}

export function invalidateCache(key?: string): void {
  if (key) {
    memoryCache.delete(key);
  } else {
    memoryCache.clear();
  }
}

// ── Global System Settings ────────────────────────────────────────────────
const SETTINGS_CACHE_KEY = "global_settings";
const SETTINGS_TTL = 60 * 1000; // 60 seconds

export async function getCachedGlobalSettings() {
  const cached = getFromCache<any>(SETTINGS_CACHE_KEY, SETTINGS_TTL);
  if (cached) return cached;

  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const settings = await db.setting.findUnique({
      where: { id: "global" },
    });
    if (settings) {
      setToCache(SETTINGS_CACHE_KEY, settings);
    }
    return settings;
  } catch (error) {
    console.warn("Could not fetch global settings from database (falling back):", error);
    return null;
  }
}

export function invalidateSettingsCache() {
  memoryCache.delete(SETTINGS_CACHE_KEY);
}

// ── Public Courses List ───────────────────────────────────────────────────
const COURSES_CACHE_KEY = "public_courses_list";
const COURSES_TTL = 60 * 1000; // 60 seconds

export async function getCachedPublicCourses() {
  const cached = getFromCache<any[]>(COURSES_CACHE_KEY, COURSES_TTL);
  if (cached) return cached;

  if (!process.env.DATABASE_URL) return [];

  try {
    const courses = await db.course.findMany({
      where: { published: true, isDeleted: false },
      orderBy: { createdAt: "desc" },
      include: {
        instructor: true,
        courseCategory: true,
        modules: {
          where: { isDeleted: false },
          include: {
            lessons: { where: { isDeleted: false }, orderBy: { order: "asc" } },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    setToCache(COURSES_CACHE_KEY, courses);
    return courses;
  } catch (error) {
    console.warn("Could not fetch public courses (using empty fallback):", error);
    return [];
  }
}

export function invalidateCoursesCache() {
  memoryCache.delete(COURSES_CACHE_KEY);
  memoryCache.delete("homepage_data");
  // Also clear any course slug and course id caches
  for (const key of memoryCache.keys()) {
    if (key.startsWith("course_slug_") || key.startsWith("course_id_")) {
      memoryCache.delete(key);
    }
  }
}

// ── Course by Slug ────────────────────────────────────────────────────────
const COURSE_SLUG_TTL = 60 * 1000; // 60 seconds

export async function getCachedCourseBySlug(slug: string) {
  const key = `course_slug_${slug}`;
  const cached = getFromCache<any>(key, COURSE_SLUG_TTL);
  if (cached) return cached;

  if (!process.env.DATABASE_URL) return null;

  try {
    const course = await db.course.findUnique({
      where: { slug },
      include: {
        instructor: true,
        courseCategory: true,
        modules: {
          where: { isDeleted: false },
          include: {
            lessons: { where: { isDeleted: false }, orderBy: { order: "asc" } },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (course) {
      setToCache(key, course);
      setToCache(`course_id_${course.id}`, course);
    }
    return course;
  } catch (error) {
    console.warn(`Could not fetch course by slug ${slug}:`, error);
    return null;
  }
}

// ── Course by ID ──────────────────────────────────────────────────────────
const COURSE_ID_TTL = 60 * 1000; // 60 seconds

export async function getCachedCourseById(id: string) {
  const key = `course_id_${id}`;
  const cached = getFromCache<any>(key, COURSE_ID_TTL);
  if (cached) return cached;

  if (!process.env.DATABASE_URL) return null;

  try {
    const course = await db.course.findUnique({
      where: { id },
      include: {
        instructor: true,
        courseCategory: true,
        modules: {
          where: { isDeleted: false },
          include: {
            lessons: { where: { isDeleted: false }, orderBy: { order: "asc" } },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (course) {
      setToCache(key, course);
      if (course.slug) {
        setToCache(`course_slug_${course.slug}`, course);
      }
    }
    return course;
  } catch (error) {
    console.warn(`Could not fetch course by id ${id}:`, error);
    return null;
  }
}

// ── Homepage Aggregated Data ──────────────────────────────────────────────
const HOMEPAGE_CACHE_KEY = "homepage_data";
const HOMEPAGE_TTL = 60 * 1000; // 60 seconds

export async function getCachedHomepageData() {
  const cached = getFromCache<any>(HOMEPAGE_CACHE_KEY, HOMEPAGE_TTL);
  if (cached) return cached;

  if (!process.env.DATABASE_URL) {
    return {
      stats: { students: 150, courses: 3, lessons: 45, rating: 4.9 },
      courses: [],
      banners: [],
    };
  }

  try {
    const [totalUsers, totalCourses, totalLessons, courses, banners] = await Promise.all([
      db.user.count().catch(() => 150),
      db.course.count({ where: { isDeleted: false } }).catch(() => 10),
      db.lesson.count({ where: { isDeleted: false } }).catch(() => 100),
      db.course.findMany({
        take: 3,
        where: { published: true, isDeleted: false },
        orderBy: { createdAt: "desc" },
        include: {
          instructor: true,
          courseCategory: true,
          modules: {
            where: { isDeleted: false },
            include: { lessons: { where: { isDeleted: false }, orderBy: { order: "asc" } } },
            orderBy: { order: "asc" },
          },
        },
      }).catch(() => []),
      db.banner.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
      }).catch(() => []),
    ]);

    const data = {
      stats: {
        students: totalUsers > 0 ? Math.max(totalUsers, 150) : 150,
        courses: totalCourses > 0 ? totalCourses : 10,
        lessons: totalLessons > 0 ? totalLessons : 100,
        rating: 4.9,
      },
      courses,
      banners,
    };

    setToCache(HOMEPAGE_CACHE_KEY, data);
    return data;
  } catch (error) {
    console.warn("Could not fetch homepage data:", error);
    return {
      stats: { students: 150, courses: 3, lessons: 45, rating: 4.9 },
      courses: [],
      banners: [],
    };
  }
}
