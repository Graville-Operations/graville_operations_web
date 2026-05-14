import { Building, Home, Wrench, HardHat, Ruler, Truck } from "lucide-react";

const services = [
  { icon: Building,  title: "Commercial Construction", desc: "Office complexes, retail centres, and mixed-use developments built to the highest commercial standards.", tag: "Commercial" },
  //{ icon: Home,      title: "Residential Projects",    desc: "Custom homes, apartment blocks, and estate developments balancing aesthetics with structural integrity.", tag: "Residential" },
  { icon: HardHat,   title: "Civil Engineering",       desc: "Roads, bridges, drainage systems, and public infrastructure — from feasibility through to commissioning.", tag: "Civil" },
  { icon: Wrench,    title: "Renovation & Fit-Out",    desc: "Precision refurbishment of existing structures, including MEP upgrades and interior transformations.", tag: "Renovation" },
  { icon: Ruler,     title: "Project Management",      desc: "End-to-end project oversight: planning, procurement, scheduling, and quality assurance.", tag: "Management" },
  //{ icon: Truck,     title: "Plant & Equipment",       desc: "Fully maintained fleet for earthworks, lifting, and specialist civil operations.", tag: "Equipment" },
];

export default function ServicesPage() {
  return (
    <div className="gv-page">
      <section className="py-5 px-8 xl:px-20 text-center">

        <p className="gv-eyebrow mb-4">What We Do</p>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6"
            style={{ color: "var(--gv-text-primary)" }}>
          Our Services
        </h1>
        <p className="text-lg leading-relaxed mb-20 mx-auto"
           style={{ color: "var(--gv-text-muted)", maxWidth: "60ch" }}>
          From groundbreaking to handover, Graville Enterprises Limited delivers across the full spectrum
          of construction and infrastructure services.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {services.map(({ icon: Icon, title, desc, tag }) => (
            <div key={title}
                 className="gv-card gv-card-hover flex flex-col gap-5">
              <span className="gv-tag self-start">{tag}</span>
              <div className="gv-icon-box">
                <Icon className="w-5 h-5" style={{ color: "var(--gv-brand)" }} />
              </div>
              <h3 className="text-xl font-bold"
                  style={{ color: "var(--gv-text-primary)" }}>
                {title}
              </h3>
              <p className="text-sm leading-relaxed flex-1"
                 style={{ color: "var(--gv-text-muted)" }}>
                {desc}
              </p>
              {/* <button className="self-start text-sm transition-colors duration-200 underline underline-offset-4"
                      style={{ color: "var(--gv-text-subtle)" }}>
                Learn more →
              </button> */}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}