import {
  Users, Package, Receipt, MapPin, Currency, ClipboardCheck,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Users,
    tag: "Workforce",
    title: "Worker & Attendance Tracking",
    body: "Know exactly who is on site, when they arrived, and what they're assigned to, from your phone, in real time. No clipboards. No disputes.",
    stat: "Zero ghost workers",
    detail: "Real-time clock-ins tied to each site, with absentee flags and a full audit trail.",
  },
  {
    icon: Package,
    tag: "Inventory",
    title: "Materials & Inventory Management",
    body: "From cement bags to heavy equipment, every item is logged on receipt, tracked in transit between sites, and reconciled on use.",
    stat: "Materials fully accounted",
    detail: "Spot wastage and theft before it compounds into a budget overrun.",
  },
  {
    icon: Receipt,
    tag: "Finance",
    title: "Payments, Invoices & Finance Logs",
    body: "Generate invoices from the field, record worker payments, and log every site expense, without ever opening a laptop.",
    stat: "Invoices in under 2 min",
    detail: "Every financial event is timestamped, categorised, and ready for audit.",
  },
  {
    icon: MapPin,
    tag: "Sites",
    title: "Site Creation & Progress Tracking",
    body: "Spin up a new site in minutes, assign resources, and watch milestones close; all tracked automatically. Director(s) get progress without a single call.",
    stat: "Live site progress",
    detail: "Multi-site dashboard. Everything visible from one screen.",
  },
  {
    icon: Currency,
    tag: "Payroll",
    title: "Automated Worker Payments",
    body: "Attendance feeds directly into payroll calculations. Approve and dispatch payments without manual reconciliation; the numbers are already there.",
    stat: "Pay runs in minutes",
    detail: "Eliminates underpayment disputes and reduces payroll errors to zero.",
  },
  {
    icon: ClipboardCheck,
    tag: "Compliance",
    title: "Logs, Reports & Audit Trails",
    body: "Every action, from a material transfer to a site milestone; is logged with a timestamp and user. Full accountability, always.",
    stat: "100% auditable",
    detail: "Export any log for client reporting or internal review in seconds.",
  },
];

export default function HomePage() {
  return (
    <div className="gv-page">

      <section className="min-h-[60vh] flex flex-col items-center justify-center text-center px-8 xl:px-20">

        <p className="gv-eyebrow mb-6">Construction Operations Platform</p>

        <h1 className="text-5xl md:text-6xl xl:text-[5.5rem] font-extrabold leading-[1.08] mb-10"
            style={{ color: "var(--gv-text-primary)" }}>
          How Much Are You Losing to Invisible Construction Operations?
        </h1>

        <div className="gv-card w-full max-w-7xl mb-10 text-center">
          <p className="text-base font-bold mb-2"
            style={{ color: "var(--gv-text-primary)" }}>
            76% of construction firms report significant losses from untracked site activity.
          </p>
          <p className="text-sm leading-relaxed"
            style={{ color: "var(--gv-text-muted)" }}>
            Missed attendance, unaccounted materials, delayed invoices — the bleed is silent
            but constant. The average mid-size contractor loses{" "}
            <strong style={{ color: "var(--gv-text-primary)" }}>KES 2–4M annually</strong>{" "}
            to operational blind spots alone. Graville Operations ends it.
          </p>
        </div>

        <div className="flex gap-4 flex-wrap justify-center">
          <Link href="/demo"    className="gv-btn-brand">See How It Works</Link>
          <Link href="/contact" className="gv-btn-outline">Talk to Us</Link>
        </div>

      </section>

      <section className="py-10 px-8 xl:px-20">

        <p className="gv-eyebrow mb-3">Platform Features</p>
        <h2 className="text-3xl md:text-4xl xl:text-5xl font-bold mb-24"
            style={{ color: "var(--gv-text-primary)" }}>
          One App. Every Operation.
        </h2>

        <div className="flex flex-col gap-24">
          {features.map(({ icon: Icon, tag, title, body, stat, detail }, index) => {
            const isReversed = index % 2 !== 0;
            return (
              <div
                key={title}
                className={`flex flex-col md:flex-row items-center gap-14
                  ${isReversed ? "md:flex-row-reverse" : ""}`}
              >
                <div className="w-full md:w-1/2">
                  <div className="gv-card gv-card-hover flex flex-col gap-5 py-12 px-10">
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
                  <p className="text-base leading-relaxed"
                     style={{ color: "var(--gv-text-muted)" }}>
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
        <p className="gv-eyebrow mb-4">Ready to stop the bleed?</p>
        <h2 className="text-3xl md:text-4xl font-bold mb-6"
            style={{ color: "var(--gv-text-primary)" }}>
          Get full visibility over your operations starting today.
        </h2>
        <div className="flex gap-4 justify-center flex-wrap mt-8">
          <Link href="/demo"    className="gv-btn-brand">Request a Demo</Link>
          <Link href="/contact" className="gv-btn-outline">Contact Us</Link>
        </div>
      </section>

    </div>
  );
}