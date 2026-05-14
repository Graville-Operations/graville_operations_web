import { MapPin, Phone, Mail } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="gv-page">
      <section className="py-5 px-8 xl:px-20 text-center">

        <p className="gv-eyebrow mb-4">Get In Touch</p>
        <h1 className="text-5xl md:text-6xl font-extrabold mb-20"
            style={{ color: "var(--gv-text-primary)" }}>
          Contact Us
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Form */}
          <div className="gv-card flex flex-col gap-6">
            <h2 className="text-xl font-bold"
                style={{ color: "var(--gv-text-primary)" }}>
              Send a Message
            </h2>

            <div>
              <label className="gv-label">Full Name</label>
              <input type="text" className="gv-input" placeholder="John Doe" />
            </div>
            <div>
              <label className="gv-label">Email</label>
              <input type="email" className="gv-input" placeholder="you@company.com" />
            </div>
            <div>
              <label className="gv-label">Message</label>
              <textarea
                rows={5}
                className="gv-input resize-none"
                placeholder="Tell us about your project..."
              />
            </div>

            <button className="gv-btn-brand w-full justify-center">
              Send Message
            </button>
          </div>

          {/* Info cards */}
          <div className="flex flex-col gap-5">
            {[
              { icon: MapPin, label: "Address", value: "Plaza 2000, Nairobi, Kenya" },
              { icon: Phone,  label: "Phone",   value: "+254 740 722 288"                        },
              { icon: Mail,   label: "Email",   value: "gravillenterpriseslimted@gmail.com"                     },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label}
                   className="gv-card gv-card-hover flex items-start gap-5">
                <div className="gv-icon-box shrink-0">
                  <Icon className="w-5 h-5" style={{ color: "var(--gv-brand)" }} />
                </div>
                <div>
                  <p className="gv-eyebrow mb-1">{label}</p>
                  <p className="text-base font-medium"
                     style={{ color: "var(--gv-text-primary)" }}>
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
}