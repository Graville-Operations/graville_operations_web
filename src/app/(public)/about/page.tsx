import { GlassCard } from "@/components/custom/glasscard";
import {
  Target, Eye, Heart, Building2, ShieldCheck, Clock, Users,
} from "lucide-react";

const whyGraville = [
  {
    icon: Building2,
    title: "10+ Years Experience",
    desc: "Decades of delivering landmark projects across residential, commercial, and civil sectors.",
    stat: "250+ projects delivered",
  },
  {
    icon: ShieldCheck,
    title: "Safety First",
    desc: "ISO-certified safety protocols on every site. Zero-compromise on worker and public safety.",
    stat: "Zero major incidents in 5 years",
  },
  {
    icon: Clock,
    title: "On-Time Delivery",
    desc: "Rigorous project management ensures milestones are hit and handovers happen on schedule.",
    stat: "94% on-time handover rate",
  },
  {
    icon: Users,
    title: "Expert Teams",
    desc: "Certified engineers, architects, and tradespeople working as one cohesive unit.",
    stat: "70+ certified professionals",
  },
];

const values = [
  { icon: Target, title: "Mission",  desc: "Give every construction team full visibility over operations, from first brick to final handover." },
  { icon: Eye,    title: "Vision",   desc: "East Africa's most trusted construction operations partner, on every scale, on every site." },
  { icon: Heart,  title: "Values",   desc: "Integrity, precision, safety, and accountability in everything we build and every system we run." },
];

export default function AboutPage() {
  return (
    <div className="gv-page">

      <section className="py-5 px-8 xl:px-20 text-center">

        <p className="gv-eyebrow mb-4">Our Story</p>

        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-8"
            style={{ color: "var(--gv-text-primary)" }}>
          Built on Foundations of Operational Truth
        </h1>

        <p className="text-base leading-relaxed mb-4 mx-auto"
          style={{ color: "var(--gv-text-muted)", maxWidth: "72ch" }}>
          Founded in 2015, Graville Enterprises Limited began as a small civil works
          contractor and has grown into a full-spectrum construction company with over
          250 completed projects across Kenya.
        </p>
        <p className="text-base leading-relaxed mx-auto mb-10"
          style={{ color: "var(--gv-text-muted)", maxWidth: "72ch" }}>
          Our team built the Graville Operation website and mobile application platform because we lived the problem,
          lost materials, unpaid workers, missed milestones. We built the fix so
          every construction business globaly can run with total transparency.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-6">
          {[
            { v: "10+", l: "Years in operation" },
            { v: "250+", l: "Projects delivered" },
            { v: "70+", l: "Team members"       },
            { v: "12",  l: "Active sites"       },
          ].map(({ v, l }) => (
            <div key={l} className="gv-card flex flex-col items-center gap-1 py-8">
              <p className="text-3xl font-extrabold"
                style={{ color: "var(--gv-text-primary)" }}>
                {v}
              </p>
              <p className="gv-eyebrow">{l}</p>
            </div>
          ))}
        </div>

      </section>

      <div className="gv-divider" />

      <section className="py-10 px-8 xl:px-20 text-center">
        <p className="gv-eyebrow mb-3">What We Stand For</p>
        <h2 className="text-3xl md:text-4xl font-bold mb-16"
            style={{ color: "var(--gv-text-primary)" }}>
          Our Core Values
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="gv-card gv-card-hover flex flex-col gap-4 py-10">
              <div className="gv-icon-box">
                <Icon className="w-5 h-5" style={{ color: "var(--gv-brand)" }} />
              </div>
              <h3 className="text-xl font-bold"
                  style={{ color: "var(--gv-text-primary)" }}>
                {title}
              </h3>
              <p className="text-sm leading-relaxed"
                 style={{ color: "var(--gv-text-muted)" }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="gv-divider" />

      <section className="py-15 px-8 xl:px-20">
        <p className="gv-eyebrow mb-3 text-center">Why Graville</p>
        <h2 className="text-3xl md:text-4xl font-bold mb-24 text-center"
            style={{ color: "var(--gv-text-primary)" }}>
          What sets us apart.
        </h2>

        <div className="flex flex-col gap-22">
          {whyGraville.map(({ icon: Icon, title, desc, stat }, index) => {
            const isReversed = index % 2 !== 0;
            return (
              <div
                key={title}
                className={`flex flex-col md:flex-row items-center gap-14
                  ${isReversed ? "md:flex-row-reverse" : ""}`}
              >
                <div className="w-full md:w-1/2">
                  <div className="gv-card gv-card-hover flex flex-col gap-5 py-10 px-10">
                    <div className="gv-icon-box">
                      <Icon className="w-5 h-5" style={{ color: "var(--gv-brand)" }} />
                    </div>
                    <p className="gv-eyebrow">0{index + 1}</p>
                    <p className="text-2xl xl:text-3xl font-bold"
                       style={{ color: "var(--gv-text-primary)" }}>
                      {stat}
                    </p>
                    <div className="gv-rule" />
                    <p className="text-sm leading-relaxed"
                       style={{ color: "var(--gv-text-muted)" }}>
                      {desc}
                    </p>
                  </div>
                </div>

                <div className="w-full md:w-1/2">
                  <p className="gv-eyebrow mb-4">Feature 0{index + 1}</p>
                  <h3 className="text-2xl xl:text-3xl font-bold mb-5"
                      style={{ color: "var(--gv-text-primary)" }}>
                    {title}
                  </h3>
                  <p className="text-base leading-relaxed"
                     style={{ color: "var(--gv-text-muted)" }}>
                    {desc}
                  </p>
                  <div className="gv-rule" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}