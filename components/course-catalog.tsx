"use client";

import { Suspense, useState } from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { courses, courseSlug } from "@/lib/courses";

type CourseGroup = keyof typeof courses;
type Course = (typeof courses)[CourseGroup][number];

const allCourses: readonly Course[] = Object.values(courses).flat();

function matches(course: Course, query: string) {
  const projects: readonly string[] = "projects" in course ? course.projects : [];
  return [course.name, ...projects].some((text) => text.toLowerCase().includes(query));
}

// useSearchParams must sit under a Suspense boundary on a statically exported page.
// The fallback is the unfiltered catalog, so the prerendered HTML still lists every course.
export default function CourseCatalog() {
  return <Suspense fallback={<CatalogContent query="" />}><CatalogFromUrl /></Suspense>;
}

function CatalogFromUrl() {
  const query = (useSearchParams().get("q") ?? "").trim();
  return <CatalogContent query={query} />;
}

function CatalogContent({ query }: { query: string }) {
  const [group, setGroup] = useState<CourseGroup>("Based on Medium");

  if (query) {
    const results = allCourses.filter((course) => matches(course, query.toLowerCase()));
    return <section className="course-catalog" aria-label="Course search results">
      <div className="search-summary">
        <p>{results.length} {results.length === 1 ? "course matches" : "courses match"} “{query}”</p>
        <Link className="view-all-link" href="/learn">Clear search</Link>
      </div>
      {results.length
        ? <div className="course-grid">{results.map((course) => <CourseCard course={course} key={course.name} />)}</div>
        : <div className="empty-state"><h3>No courses match yet.</h3><p>Try a medium like “watercolor” or a subject like “flowers”.</p></div>}
    </section>;
  }

  return <section className="course-catalog" aria-label="Browse courses">
    <div className="filter-tabs" role="group" aria-label="Course categories">
      {(Object.keys(courses) as CourseGroup[]).map((name) => <button key={name} aria-pressed={group === name} className={group === name ? "selected" : ""} onClick={() => { setGroup(name); }}>{name}</button>)}
    </div>
    <div className="course-grid">
      {courses[group].map((course) => <CourseCard course={course} key={course.name} />)}
    </div>
  </section>;
}

function CourseCard({ course }: { course: Course }) {
  return <article className={`course-card course-${course.color}`}>
    <Link className="course-card-toggle" href={`/learn/${courseSlug(course.name)}`}>
      <span className="course-symbol" aria-hidden="true">{course.symbol}</span>
      <span className="course-card-text"><strong>{course.name}</strong><small>Explore lessons and projects</small></span>
    </Link>
  </article>;
}
