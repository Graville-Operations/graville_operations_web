'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2, Building2, Users,
  Receipt, MapPin, ClipboardCheck, Package,
} from 'lucide-react';

const benefits = [
  { icon: Users,          text: 'Real-time worker & attendance tracking' },
  { icon: Package,        text: 'Full materials & inventory management' },
  { icon: Receipt,        text: 'Invoices and payments from the field' },
  { icon: MapPin,         text: 'Multi-site progress dashboard' },
  { icon: ClipboardCheck, text: '100% auditable logs and reports' },
  { icon: Building2,      text: 'Built for African contractors' },
];

export default function DemoPage() {
  const [form, setForm] = useState({
    name:    '',
    email:   '',
    phone:   '',
    company: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const subject = encodeURIComponent(`Demo Request – ${form.company}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nCompany: ${form.company}`
    );

    window.location.href = `mailto:info@graville.co.ke?subject=${subject}&body=${body}`;

    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div
      className="gv-page"
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    >
      <div className="flex-1 px-6 md:px-12 xl:px-24 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left — pitch */}
          <div>
            <p className="gv-eyebrow mb-4">Request a Demo</p>
            <h1
              className="text-4xl xl:text-5xl font-extrabold leading-tight mb-6"
              style={{ color: 'var(--gv-text-primary)' }}
            >
              See Graville Operations in action.
            </h1>
            <p
              className="text-base leading-relaxed mb-10"
              style={{ color: 'var(--gv-text-muted)' }}
            >
              Book a personalised walkthrough with our team. We&apos;ll show you exactly
              how Graville Operations eliminates the blind spots costing your business
              every month — and how fast you can be up and running.
            </p>

            {/* Benefits list */}
            <div className="flex flex-col gap-4 mb-10">
              {benefits.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="gv-icon-box shrink-0" style={{ width: '2rem', height: '2rem' }}>
                    <Icon size={15} style={{ color: 'var(--gv-brand)' }} />
                  </div>
                  <p className="text-sm" style={{ color: 'var(--gv-text-muted)' }}>{text}</p>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div
              className="gv-card"
              style={{
                background: 'rgba(51,144,124,0.08)',
                border: '1px solid rgba(51,144,124,0.20)',
              }}
            >
              <p className="text-sm leading-relaxed italic mb-3" style={{ color: 'var(--gv-text-muted)' }}>
                &quot;Before Graville, we had no idea what was happening on site unless
                someone called us. Now we see everything — workers, materials, invoices —
                in real time.&quot;
              </p>
              <p className="text-xs font-semibold" style={{ color: 'var(--gv-brand)' }}>
                — Site Director, Nairobi Construction Firm
              </p>
            </div>
          </div>

          {/* Right — form */}
          <div>
            {submitted ? (
              /* Success state */
              <div
                className="gv-card flex flex-col items-center text-center gap-6 py-16"
                style={{ border: '1px solid rgba(51,144,124,0.30)' }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(51,144,124,0.15)' }}
                >
                  <CheckCircle2 size={32} style={{ color: 'var(--gv-brand)' }} />
                </div>
                <div>
                  <h2
                    className="text-2xl font-bold mb-2"
                    style={{ color: 'var(--gv-text-primary)' }}
                  >
                    Request received!
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--gv-text-muted)' }}>
                    Thank you,{' '}
                    <strong style={{ color: 'var(--gv-text-primary)' }}>{form.name}</strong>.
                    Our team will reach out to{' '}
                    <strong style={{ color: 'var(--gv-text-primary)' }}>{form.email}</strong>{' '}
                    within one business day to schedule your personalised demo.
                  </p>
                </div>
                <div className="flex gap-3 flex-wrap justify-center">
                  <Link href="/" className="gv-btn-outline text-sm px-5 py-2.5">
                    Back to Home
                  </Link>
                  <Link href="/signin" className="gv-btn-brand text-sm px-5 py-2.5">
                    Sign In
                  </Link>
                </div>
              </div>
            ) : (
              /* Form */
              <div className="gv-card">
                <h2
                  className="text-xl font-bold mb-1"
                  style={{ color: 'var(--gv-text-primary)' }}
                >
                  Book your demo
                </h2>
                <p className="text-sm mb-6" style={{ color: 'var(--gv-text-subtle)' }}>
                  Fill in your details and we&apos;ll be in touch within 24 hours.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* Name */}
                  <div>
                    <label className="gv-label">Full Name *</label>
                    <input
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="John Kamau"
                      required
                      className="gv-input"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="gv-label">Work Email *</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="john@yourcompany.com"
                      required
                      className="gv-input"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="gv-label">Phone Number *</label>
                    <input
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+254 700 000 000"
                      required
                      className="gv-input"
                    />
                  </div>

                  {/* Company */}
                  <div>
                    <label className="gv-label">Company Name *</label>
                    <input
                      name="company"
                      type="text"
                      value={form.company}
                      onChange={handleChange}
                      placeholder="Acme Contractors Ltd"
                      required
                      className="gv-input"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="gv-btn-brand w-full mt-2"
                    style={{
                      opacity: isLoading ? 0.6 : 1,
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isLoading ? 'Sending...' : 'Request My Demo'}
                  </button>

                  <p className="text-xs text-center" style={{ color: 'var(--gv-text-faint)' }}>
                    No spam. No commitment. Just a conversation.
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer strip */}
      <div className="gv-divider" />
      <div className="px-8 py-6 text-center">
        <p className="text-xs" style={{ color: 'var(--gv-text-subtle)' }}>
          © {new Date().getFullYear()} Graville Enterprises Limited. All rights reserved.
        </p>
      </div>
    </div>
  );
}