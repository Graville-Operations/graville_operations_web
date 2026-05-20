import {
  Users, Package, Receipt, MapPin, Currency, ClipboardCheck,
} from "lucide-react";
import Link from "next/link";

const services = [
  {
    id: "workforce",
    icon: Users,
    tag: "Workforce",
    title: "Worker and Attendance Tracking",
    body: "Ghost workers and inflated headcounts silently drain construction budgets. Graville Operations ties every clock-in to a named worker and a specific site, in real time, from any phone. Supervisors get live attendance dashboards; directors get absentee alerts before the day's work even begins. Every entry carries a timestamp and a full audit trail, so disputes are settled with data, not memory.",
    stat: "Zero ghost workers",
    detail: "Real-time clock-ins tied to each site, with absentee flags and a full audit trail.",
  },
  {
    id: "inventory",
    icon: Package,
    tag: "Inventory",
    title: "Materials and Inventory Management",
    body: "From the first cement bag to the last fitting, every item is logged on receipt, tracked through inter-site transfers, and reconciled against actual use. Variances surface instantly, so wastage and pilferage are caught before they compound into a budget overrun. No more end-of-month stocktake surprises; the numbers are live, always.",
    stat: "Materials fully accounted",
    detail: "Spot wastage and theft before it compounds into a budget overrun.",
  },
  {
    id: "finance",
    icon: Receipt,
    tag: "Finance",
    title: "Payments, Invoices and Finance Logs",
    body: "Finance shouldn't require a laptop or a round trip to the office. From the field, supervisors generate invoices, record supplier payments, and log every site expense in under two minutes. Every transaction is timestamped, categorised, and linked to the relevant site; creating a clean, auditable ledger that your accountant and your client can trust.",
    stat: "Invoices in under 2 min",
    detail: "Every financial event is timestamped, categorised, and ready for audit.",
  },
  {
    id: "sites",
    icon: MapPin,
    tag: "Sites",
    title: "Site Creation and Progress Tracking",
    body: "Spin up a new site in minutes: name it, assign resources, set milestones. As work progresses, milestones close automatically and the multi-site dashboard reflects the update in real time. Directors get accurate progress without a single status call. If a site falls behind, the platform flags it, not a frustrated subcontractor two weeks later.",
    stat: "Live site progress",
    detail: "Multi-site dashboard. Everything visible from one screen.",
  },
  {
    id: "payroll",
    icon: Currency,
    tag: "Payroll",
    title: "Automated Worker Payments",
    body: "Because attendance feeds directly into payroll calculations, there is nothing to reconcile manually. When pay-run day arrives, the numbers are already there; verified, categorised, and ready for approval. Dispatch payments in minutes, not days. Underpayment disputes drop to zero because every worker can see exactly what they are owed and why.",
    stat: "Pay runs in minutes",
    detail: "Eliminates underpayment disputes and reduces payroll errors to zero.",
  },
  {
    id: "compliance",
    icon: ClipboardCheck,
    tag: "Compliance",
    title: "Logs, Reports and Audit Trails",
    body: "Every action on the platform; material transfer, site milestone, payment, attendance record, is logged with a timestamp and the name of the user who triggered it. Nothing is editable after the fact without a trace. When a client requests a progress report or an auditor asks for a payment log, you export it in seconds. Full accountability, always, with no extra effort.",
    stat: "100% auditable",
    detail: "Export any log for client reporting or internal review in seconds.",
  },
];

export default function ServicesPage() {
  return (
    <div className="gv-page">

      {/* HEADER */}
      <section className="py-5 px-8 xl:px-20 text-center">
        <p className="gv-eyebrow mb-4">What We Do</p>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6"
            style={{ color: "var(--gv-text-primary)" }}>
          Our Services
        </h1>
        <p className="text-lg leading-relaxed mb-20 mx-auto"
           style={{ color: "var(--gv-text-muted)", maxWidth: "60ch" }}>
          From groundbreaking to handover, Graville Operations gives every layer of your
          team the tools they need, and gives you the visibility to run tighter, leaner sites.
        </p>
      </section>

      {/* ALTERNATING SERVICE ROWS */}
      <section className="pb-20 px-8 xl:px-20">
        <div className="flex flex-col gap-22">
          {services.map(({ id, icon: Icon, tag, title, body, stat, detail }, index) => {
            const isReversed = index % 2 !== 0;
            return (
              <div
                id={id}
                key={id}
                className={`flex flex-col md:flex-row items-center gap-14
                  ${isReversed ? "md:flex-row-reverse" : ""}`}
              >
                {/* Stat card */}
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
                    <p className="text-sm leading-relaxed" style={{ color: "var(--gv-text-muted)" }}>
                      {detail}
                    </p>
                  </div>
                </div>

                {/* Text side */}
                <div className="w-full md:w-1/2">
                  <span className="gv-tag mb-5 inline-block">{tag}</span>
                  <h3 className="text-2xl xl:text-3xl font-bold mb-5"
                      style={{ color: "var(--gv-text-primary)" }}>
                    {title}
                  </h3>
                  <p className="text-base leading-relaxed" style={{ color: "var(--gv-text-muted)" }}>
                    {body}
                  </p>
                  <div className="gv-rule" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <div className="gv-divider" />
      <section className="py-24 px-8 xl:px-20 text-center">
        <p className="gv-eyebrow mb-4">See it in action</p>
        <h2 className="text-3xl md:text-4xl font-bold mb-6"
            style={{ color: "var(--gv-text-primary)" }}>
          Ready to bring every operation under one roof?
        </h2>
        <div className="flex gap-4 justify-center flex-wrap mt-8">
          <Link href="/demo"    className="gv-btn-brand">Request a Demo</Link>
          <Link href="/contact" className="gv-btn-outline">Contact Us</Link>
        </div>
      </section>

    </div>
  );
}