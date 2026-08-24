import React, { useState } from "react";
import { Mail, Phone, MessageSquare, Send, CheckCircle, ShieldAlert, MapPin, Navigation, Copy, ExternalLink, Github } from "lucide-react";
import { useForm } from "react-hook-form";
import { dbAPI } from "../lib/db";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

interface ContactFormInput {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormInput>();

  const physicalAddress = "27 Atteridgeville, Pretoria West, 0008, Gauteng";
  const mapApiKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || "";
  const hasValidMapKey = Boolean(mapApiKey) && mapApiKey !== "YOUR_API_KEY";

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(physicalAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 3000);
  };

  const onSubmit = (data: ContactFormInput) => {
    dbAPI.submitContact(data);
    setSubmitted(true);
    reset();
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="pb-20 space-y-20">
      
      {/* HEADER HERO BANNER */}
      <section className="bg-gradient-to-r from-navy-900 to-navy-950 text-white py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-xs font-mono font-bold uppercase text-gold-400 bg-gold-400/10 px-3 py-1 rounded-full">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white leading-none">
            Let's Upgrade Your Mathematics Mark
          </h1>
          <p className="text-xs sm:text-sm text-navy-200 max-w-2xl mx-auto leading-relaxed">
            Have questions about second-chance Matric registration, CAPS syllabus requirements, or pricing packages? Drop us a line and Bethuel Moukangwe will reply within 1 hour.
          </p>
        </div>
      </section>

      {/* CONTACT BODY BENTO GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Left Column: Coordinates & Office Picture */}
          <div className="lg:col-span-5 space-y-8 flex flex-col justify-between">
            
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-navy-900 dark:text-white">Our Coordinates</h2>
              <p className="text-xs text-navy-500 dark:text-navy-400 leading-relaxed">
                Connect directly with head tutor Bethuel Moukangwe via your preferred channel. Phone, email, and WhatsApp hotlines are monitored 7 days a week.
              </p>

              <div className="space-y-4 font-mono text-xs text-navy-600 dark:text-navy-300">
                <div className="flex items-center gap-3 p-4 bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-xl hover:border-royal-300 dark:hover:border-navy-700 transition-colors">
                  <MapPin className="w-5 h-5 text-gold-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-navy-900 dark:text-white uppercase text-[10px]">Physical Address</h4>
                    <p className="mt-0.5 font-semibold text-navy-800 dark:text-navy-200">27 Atteridgeville, Pretoria West, 0008, Gauteng</p>
                  </div>
                </div>

                <a 
                  href="tel:+27714156665" 
                  className="flex items-center gap-3 p-4 bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-xl hover:border-royal-300 dark:hover:border-navy-700 transition-colors"
                >
                  <Phone className="w-5 h-5 text-gold-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-navy-900 dark:text-white uppercase text-[10px]">Phone Hotline</h4>
                    <p className="mt-0.5">071 415 6665</p>
                  </div>
                </a>

                <a 
                  href="mailto:bethuelmoukangwe8@gmail.com" 
                  className="flex items-center gap-3 p-4 bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-xl hover:border-royal-300 dark:hover:border-navy-700 transition-colors"
                >
                  <Mail className="w-5 h-5 text-gold-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <h4 className="font-bold text-navy-900 dark:text-white uppercase text-[10px]">Official Email</h4>
                    <p className="mt-0.5 break-all">bethuelmoukangwe8@gmail.com</p>
                  </div>
                </a>

                <a 
                  href="https://wa.me/27714156665" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-3 p-4 bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/10 transition-all"
                >
                  <MessageSquare className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-emerald-600 dark:text-emerald-400 uppercase text-[10px]">Instant WhatsApp Chat</h4>
                    <p className="mt-0.5 text-emerald-700 dark:text-emerald-400 font-bold">071 415 6665</p>
                  </div>
                </a>

                <a 
                  href="https://github.com/BETHUELTHIPE" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-3 p-4 bg-navy-900 dark:bg-navy-850 text-white border border-navy-700 rounded-xl hover:border-gold-400 transition-all group"
                >
                  <Github className="w-5 h-5 text-gold-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-gold-400 uppercase text-[10px]">GitHub & Open Source</h4>
                      <ExternalLink className="w-3.5 h-3.5 text-navy-400 group-hover:text-gold-400" />
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-white">github.com/BETHUELTHIPE</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Office picture embedded here */}
            <div className="space-y-2">
              <div className="relative rounded-xl overflow-hidden border border-navy-200 dark:border-navy-800 shadow-md bg-navy-100 aspect-video">
                <img 
                  src="/public/pages/about/My_office_photo.jpeg" 
                  alt="Amaris Tutoring Office desk and monitor"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop";
                  }}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/40 via-transparent to-transparent" />
              </div>
              <p className="text-[10px] text-navy-400 font-mono text-center">
                Our main digital recording studio in Pretoria.
              </p>
            </div>

          </div>

          {/* Right Column: Contact Message Form */}
          <div className="lg:col-span-7 bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 p-6 sm:p-8 rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-navy-900 dark:text-white">Send an Enquiry</h2>
                <p className="text-xs text-navy-500 dark:text-navy-400">
                  Fill in the secure form below. We will receive your query immediately and compile an upgrade plan tailored to your grade level.
                </p>
              </div>

              {submitted ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 p-6 rounded-xl text-center space-y-3">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Enquiry Dispatched Successfully!</h3>
                  <p className="text-xs text-navy-600 dark:text-navy-300">
                    Thank you! We have registered your message in our offline secure logs. A mathematics program consultant will contact you via WhatsApp/Email shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">Full Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Sipho Ndlovu"
                        {...register("name", { required: "Name is required" })}
                        className="w-full px-3 py-2.5 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                      />
                      {errors.name && <p className="text-red-500 mt-1 font-mono text-[10px]">{errors.name.message}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">Email Address</label>
                      <input 
                        type="email" 
                        placeholder="e.g. sipho@gmail.com"
                        {...register("email", { 
                          required: "Email is required",
                          pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                        })}
                        className="w-full px-3 py-2.5 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                      />
                      {errors.email && <p className="text-red-500 mt-1 font-mono text-[10px]">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">South African Phone</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 071 415 6665"
                        {...register("phone", { required: "Phone number is required" })}
                        className="w-full px-3 py-2.5 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                      />
                      {errors.phone && <p className="text-red-500 mt-1 font-mono text-[10px]">{errors.phone.message}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">Subject stream</label>
                      <select 
                        {...register("subject", { required: "Subject is required" })}
                        className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                      >
                        <option value="Core Mathematics Upgrade (CAPS)">Core Mathematics Upgrade (CAPS)</option>
                        <option value="Advanced Programme (AP) Mathematics Upgrade">Advanced Programme (AP) Mathematics Upgrade</option>
                        <option value="IEB Mathematics Upgrade">IEB Mathematics Upgrade</option>
                        <option value="Technical Mathematics Upgrade">Technical Mathematics Upgrade</option>
                        <option value="Mathematical Literacy Upgrade">Mathematical Literacy Upgrade</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-black text-navy-500 dark:text-navy-400 uppercase mb-1">Enquiry Details</label>
                    <textarea 
                      rows={5}
                      placeholder="Detail your maths challenges, grade level, and target mark. e.g. I got 48% in 2025 NSC, need 75% for engineering..."
                      {...register("message", { required: "Enquiry message is required" })}
                      className="w-full px-3 py-2.5 bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-navy-800 rounded-lg text-navy-900 dark:text-white focus:outline-none focus:border-royal-500"
                    />
                    {errors.message && <p className="text-red-500 mt-1 font-mono text-[10px]">{errors.message.message}</p>}
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-3 bg-gradient-to-r from-royal-600 to-royal-700 hover:from-royal-700 hover:to-royal-800 text-white font-extrabold rounded-lg flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Submit Secure Enquiry
                  </button>

                </form>
              )}
            </div>

            <div className="border-t border-navy-100 dark:border-navy-800 mt-6 pt-4 flex items-center gap-2 text-[10px] text-navy-400 font-mono">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>SSL Secure - Personal information encrypted</span>
            </div>
          </div>

        </div>
      </section>

      {/* GOOGLE MAP LOCATION ATTACHMENT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-navy-900 border border-navy-150 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-lg space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-navy-100 dark:border-navy-800">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-gold-500/10 text-gold-600 dark:text-gold-400 rounded-2xl border border-gold-500/20 shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-royal-500/10 text-royal-600 dark:text-royal-300 border border-royal-500/20 uppercase">
                    Interactive Google Map
                  </span>
                  <span className="text-xs font-mono text-navy-400">Pretoria West Branch</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-display text-navy-900 dark:text-white">
                  Location & Directions
                </h3>
                <p className="text-xs sm:text-sm text-navy-600 dark:text-navy-300 font-mono">
                  {physicalAddress}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={handleCopyAddress}
                className="px-3.5 py-2.5 bg-navy-50 dark:bg-navy-950 hover:bg-navy-100 dark:hover:bg-navy-850 text-navy-800 dark:text-navy-200 border border-navy-200 dark:border-navy-800 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                {copiedAddress ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-navy-500" />}
                <span>{copiedAddress ? "Copied!" : "Copy Address"}</span>
              </button>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(physicalAddress)}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 bg-gradient-to-r from-royal-600 to-royal-700 hover:from-royal-700 hover:to-royal-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Navigation className="w-4 h-4 text-gold-400" />
                <span>Get Directions</span>
              </a>

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(physicalAddress)}`}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-navy-50 dark:bg-navy-950 hover:bg-navy-100 dark:hover:bg-navy-850 text-navy-600 dark:text-navy-300 border border-navy-200 dark:border-navy-800 rounded-xl transition-all cursor-pointer"
                title="Open in Google Maps App"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* MAP CANVAS CONTAINER */}
          <div className="relative w-full h-[400px] sm:h-[480px] rounded-2xl overflow-hidden border border-navy-200 dark:border-navy-800 shadow-inner bg-navy-950">
            {hasValidMapKey ? (
              <APIProvider apiKey={mapApiKey} version="weekly">
                <Map
                  defaultCenter={{ lat: -25.7712, lng: 28.0706 }}
                  defaultZoom={15}
                  mapId="DEMO_MAP_ID"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  style={{ width: '100%', height: '100%' }}
                >
                  <AdvancedMarker position={{ lat: -25.7712, lng: 28.0706 }} title={physicalAddress}>
                    <Pin background="#f59e0b" glyphColor="#0f172a" borderColor="#b45309" />
                  </AdvancedMarker>
                </Map>
              </APIProvider>
            ) : (
              <iframe
                title="Google Maps Location - 27 Atteridgeville, Pretoria West, 0008, Gauteng"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://maps.google.com/maps?q=${encodeURIComponent(physicalAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full grayscale-[0.1] contrast-[1.05]"
              />
            )}

            {/* OVERLAY BADGE */}
            <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-navy-950/90 dark:bg-navy-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-navy-700/60 text-white shadow-xl flex items-center justify-between gap-4 max-w-md">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gold-500 text-navy-950 font-black">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-display text-white">Amaris Mathematics Hub</h4>
                  <p className="text-[11px] font-mono text-navy-300">27 Atteridgeville, Pretoria West, 0008</p>
                </div>
              </div>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(physicalAddress)}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-extrabold text-[11px] rounded-xl flex items-center gap-1 transition-colors shrink-0"
              >
                <span>Navigate</span>
                <Navigation className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
