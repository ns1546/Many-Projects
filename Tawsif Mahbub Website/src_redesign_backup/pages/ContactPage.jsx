import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, ShieldCheck, Clock, FileText } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    email: '',
    phone: '',
    projectType: 'Telefilm / Television Fiction',
    dates: '',
    brief: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setSubmitted(true);
  };

  return (
    <div className="contact-page-root">
      {/* 1. PAGE HEADER */}
      <section className="page-header-section">
        <div className="container">
          <span className="editorial-kicker">ARTIST REPRESENTATION & SCRIPT DESK</span>
          <h1 className="page-main-title">DIRECT BOOKING & SCRIPTS</h1>
          <p className="page-subtitle-text">
            Official representation desk for film productions, television fictions, OTT original scripts, commercial endorsements, and brand partnerships.
          </p>
        </div>
      </section>

      {/* 2. MAIN BOOKING WORKSPACE SPREAD */}
      <section className="booking-spread-section">
        <div className="container">
          <div className="booking-grid">
            {/* Left Column: Official Management Details */}
            <div className="booking-info-col">
              <span className="bic-kicker">REPRESENTATION DESK</span>
              <h2 className="bic-title">TALENT MANAGEMENT & ARTIST LIAISON</h2>
              <p className="bic-desc">
                All scripts, commercial proposals, and broadcast casting agreements are directly coordinated through Tawsif Mahbub's dedicated management team in Dhaka.
              </p>

              <div className="bic-details-list">
                <div className="bic-detail-item">
                  <div className="bdi-icon"><MapPin size={18} /></div>
                  <div className="bdi-text">
                    <strong>MANAGEMENT HEADQUARTERS</strong>
                    <span>Dhanmondi, Dhaka 1205, Bangladesh</span>
                  </div>
                </div>

                <div className="bic-detail-item">
                  <div className="bdi-icon"><Mail size={18} /></div>
                  <div className="bdi-text">
                    <strong>SCRIPT SUBMISSIONS & INQUIRIES</strong>
                    <span>management@tawsifmahbub.com</span>
                    <span className="bdi-sub">booking@tawsifmahbub.com</span>
                  </div>
                </div>

                <div className="bic-detail-item">
                  <div className="bdi-icon"><Phone size={18} /></div>
                  <div className="bdi-text">
                    <strong>MANAGEMENT PHONE & WHATSAPP</strong>
                    <span>+880 1700-TAWSIF (Official Liaison)</span>
                  </div>
                </div>
              </div>

              {/* Protocol Pillars */}
              <div className="booking-protocols-box">
                <span className="bpb-header"><ShieldCheck size={16} /> CASTING & PRODUCTION PROTOCOLS</span>
                <ul className="bpb-list">
                  <li><FileText size={14} /> Full treatment or bound screenplay required for fiction submissions.</li>
                  <li><Clock size={14} /> Standard schedule confirmation window: 5 to 7 business days.</li>
                  <li><CheckCircle2 size={14} /> Complete brand exclusivity terms available upon formal request.</li>
                </ul>
              </div>
            </div>

            {/* Right Column: Direct Booking Form */}
            <div className="booking-form-col">
              <div className="booking-form-card">
                {submitted ? (
                  <div className="booking-success-box">
                    <CheckCircle2 size={48} className="bsb-icon" />
                    <h3 className="bsb-title">DOSSIER INQUIRY RECEIVED</h3>
                    <p className="bsb-desc">
                      Thank you, <strong>{formData.name}</strong>. Your production inquiry for <em>{formData.organization}</em> has been logged in Tawsif Mahbub's artist coordination calendar. The management office will review the details and reach out within 48 hours.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({
                          name: '',
                          organization: '',
                          email: '',
                          phone: '',
                          projectType: 'Telefilm / Television Fiction',
                          dates: '',
                          brief: ''
                        });
                      }}
                      className="bsb-btn"
                    >
                      SUBMIT ANOTHER PROPOSAL
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="booking-formal-form">
                    <h3 className="bff-title">PRODUCTION & BOOKING INQUIRY</h3>
                    <p className="bff-sub">Please provide production parameters for scheduling and script review.</p>

                    <div className="bff-form-row">
                      <div className="bff-field">
                        <label>CONTACT PERSON NAME *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Director / Executive Producer"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>

                      <div className="bff-field">
                        <label>PRODUCTION HOUSE / BRAND *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. CMV / Chorki / Agency"
                          value={formData.organization}
                          onChange={e => setFormData({ ...formData, organization: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="bff-form-row">
                      <div className="bff-field">
                        <label>OFFICIAL EMAIL ADDRESS *</label>
                        <input
                          type="email"
                          required
                          placeholder="producer@studio.com"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>

                      <div className="bff-field">
                        <label>PHONE / WHATSAPP NUMBER *</label>
                        <input
                          type="tel"
                          required
                          placeholder="+880 1..."
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="bff-form-row">
                      <div className="bff-field">
                        <label>PROJECT CLASSIFICATION</label>
                        <select
                          value={formData.projectType}
                          onChange={e => setFormData({ ...formData, projectType: e.target.value })}
                        >
                          <option>Telefilm / Television Fiction</option>
                          <option>OTT Original Web Series</option>
                          <option>Feature Film / Cinema</option>
                          <option>Commercial Brand Campaign</option>
                          <option>Gala / Festival Appearance</option>
                          <option>Press / Media Interview</option>
                        </select>
                      </div>

                      <div className="bff-field">
                        <label>PROPOSED DATES / TIMEFRAME</label>
                        <input
                          type="text"
                          placeholder="e.g. November 2026 / 5 Days"
                          value={formData.dates}
                          onChange={e => setFormData({ ...formData, dates: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="bff-field">
                      <label>PROJECT SYNOPSIS / CREATIVE BRIEF *</label>
                      <textarea
                        rows="4"
                        required
                        placeholder="Provide a brief summary of the character role, director, production scale, or campaign objectives..."
                        value={formData.brief}
                        onChange={e => setFormData({ ...formData, brief: e.target.value })}
                      ></textarea>
                    </div>

                    <button type="submit" className="bff-submit-btn">
                      <Send size={15} /> SUBMIT OFFICIAL INQUIRY DOSSIER
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
    </div >
  );
}
