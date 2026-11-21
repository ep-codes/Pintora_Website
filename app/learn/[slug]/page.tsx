import Link from "next/link";
import { notFound } from "next/navigation";
import SiteShell from "@/components/site-shell";
import { courses, courseSlug } from "@/lib/courses";

const allCourses = Object.values(courses).flat();

export function generateStaticParams() {
  return allCourses.map((course) => ({ slug: courseSlug(course.name) }));
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = allCourses.find((item) => courseSlug(item.name) === slug);
  if (!course) notFound();
  const projects: readonly string[] = "projects" in course ? course.projects : [`${course.name} study`, `${course.name} composition`, `${course.name} creative project`];

  return <SiteShell>
    <Link href="/learn" className="course-back">← All courses</Link>
    <section className="page-intro">
      <div className="eyebrow">EXPLORE & CREATE</div>
      <h1>Explore <em>{course.name}.</em></h1>
      <p>Start with a little inspiration and make something your own.</p>
    </section>
    <div className="course-detail-intro"><span className="course-symbol" aria-hidden="true">{course.symbol}</span><div><h2>Your creative starting point</h2><p>Explore {course.name.toLowerCase()} through these beginner-friendly project ideas. Try a simple study first, then experiment with your own colors and composition.</p></div></div>
    <h2 className="course-detail-heading">Projects to try</h2>
    <div className="course-grid">{projects.map((project, index) => <article className={`course-card course-${course.color} course-detail-card`} key={project}><span className="course-level">PROJECT {String(index + 1).padStart(2, "0")} · BEGINNER</span><h3>{project}</h3><p>Gather your materials, sketch out an idea, and create your own take on {project.toLowerCase()}.</p></article>)}</div>
  </SiteShell>;
}
