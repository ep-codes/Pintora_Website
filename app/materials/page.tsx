import SiteShell from "@/components/site-shell";
import MaterialsLibrary from "@/components/materials-library";

export const metadata = { title: "Materials" };

export default function MaterialsPage() {
  return <SiteShell>
    <section className="page-intro">
      <div className="eyebrow">A BEGINNER’S GUIDE</div>
      <h1>Good things start<br /><em>with simple materials.</em></h1>
      <p>A beginner’s guide to the supplies used in every Pintora course, and what each one is good for.</p>
    </section>
    <MaterialsLibrary />
  </SiteShell>;
}
