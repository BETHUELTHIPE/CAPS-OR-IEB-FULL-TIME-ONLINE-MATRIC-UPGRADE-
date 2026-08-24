import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Check, Info, Sparkles, HelpCircle, CheckCircle2, ShieldCheck, ArrowRight, X } from "lucide-react";
import { dbAPI } from "../lib/db";
import { LessonPackage } from "../types";
import { GooglePayButton } from "./GooglePayButton";

export const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<LessonPackage[]>([]);
  const [purchasedPackage, setPurchasedPackage] = useState<{
    pkg: LessonPackage;
    txId: string;
  } | null>(null);

  useEffect(() => {
    setPackages(dbAPI.getPackages());
  }, []);

  const handleGooglePaySuccess = (pkg: LessonPackage, details: any) => {
    // Record payment in local DB
    dbAPI.createPayment({
      booking_id: "PKG-PURCHASE-" + details.transactionId,
      student_id: "usr-guest",
      amount: details.amount,
      currency: details.currency || "ZAR",
      payment_method: details.paymentMethod || "Google Pay",
      transaction_id: details.transactionId,
      status: "successful"
    });

    setPurchasedPackage({
      pkg,
      txId: details.transactionId
    });
  };

  return (
    <div className="pb-20 space-y-20">
      
      {/* HEADER HERO BANNER */}
      <section className="bg-gradient-to-r from-navy-900 to-navy-950 text-white py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-xs font-mono font-bold uppercase text-gold-400 bg-gold-400/10 px-3 py-1 rounded-full border border-gold-400/20">
            Our Packages & Google Pay Instant Checkout
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white leading-none">
            Flexible, Discounted Lesson Packages
          </h1>
          <p className="text-xs sm:text-sm text-navy-200 max-w-2xl mx-auto leading-relaxed">
            Choose the level of tutoring focus that fits your timeline. Save up to 25% with multi-lesson packs featuring collaborative homework reviews, digital notes, parent reports, and instant Google Pay security.
          </p>
        </div>
      </section>

      {/* PRICING CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch"
        >
          {packages.map((pkg) => {
            const isPopular = pkg.id === "pkg-3"; // 8 lesson
            const isUnlimited = pkg.id === "pkg-4"; // Monthly Unlimited

            return (
              <motion.div 
                key={pkg.id}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } }
                }}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`bg-white dark:bg-navy-900 border rounded-2xl p-6 flex flex-col justify-between relative shadow-sm hover:shadow-2xl transition-all duration-300 ${
                  isPopular 
                    ? "border-gold-500 scale-100 lg:scale-[1.03] ring-2 ring-gold-500/20" 
                    : "border-navy-150 dark:border-navy-800"
                }`}
              >
                {/* Popular badge */}
                {isPopular && (
                  <motion.span 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 text-[10px] font-black uppercase rounded-full tracking-wider flex items-center gap-1 shadow-md"
                  >
                    <Sparkles className="w-3 h-3 animate-spin-slow" />
                    Best Value Option
                  </motion.span>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-extrabold text-navy-900 dark:text-white uppercase tracking-wider">{pkg.name}</h3>
                    <p className="text-[11px] text-navy-500 dark:text-navy-400 mt-2 leading-relaxed h-10">{pkg.description}</p>
                  </div>

                  <div className="border-t border-b border-navy-100 dark:border-navy-800 py-4">
                    <div className="flex items-baseline gap-1 justify-center">
                      <span className="text-3xl font-black text-navy-900 dark:text-white font-display">R{pkg.price}</span>
                      <span className="text-xs text-navy-400">ZAR</span>
                    </div>
                    {pkg.discount_percentage > 0 && (
                      <div className="text-center mt-1">
                        <span className="text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded">
                          Save {pkg.discount_percentage}% vs Single Sessions
                        </span>
                      </div>
                    )}
                    <div className="text-center text-[10px] font-mono text-navy-400 mt-2">
                      {pkg.lessons_count} {pkg.lessons_count === 1 ? "Dedicated Session" : "Dedicated Sessions"}
                    </div>
                  </div>

                  {/* Feature list */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-mono font-black text-navy-900 dark:text-white uppercase tracking-wider">What's Included:</h4>
                    <ul className="space-y-2.5">
                      {pkg.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-navy-600 dark:text-navy-300">
                          <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-navy-100 dark:border-navy-800 space-y-3">
                  {/* Google Pay Instant Button */}
                  <GooglePayButton
                    amount={pkg.price}
                    itemTitle={`Amaris ${pkg.name}`}
                    itemDescription={`${pkg.lessons_count} tutoring sessions package`}
                    merchantId="BCR2DN7TRHFIFPYC"
                    merchantName="Amaris Learning Hub"
                    buttonText="Buy with Google Pay"
                    size="sm"
                    className="w-full"
                    onSuccess={(details) => handleGooglePaySuccess(pkg, details)}
                  />

                  <Link 
                    to={`/book?package=${pkg.id}`}
                    className={`w-full py-2.5 text-center block text-xs font-black rounded-xl transition-all ${
                      isPopular 
                        ? "bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-navy-950 shadow-md" 
                        : "bg-royal-600 hover:bg-royal-700 text-white"
                    }`}
                  >
                    Select & Book Schedule
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* GOOGLE PAY PURCHASE SUCCESS MODAL */}
      {purchasedPackage && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-navy-150 dark:border-navy-800 space-y-6 text-center animate-scaleUp relative">
            <button
              onClick={() => setPurchasedPackage(null)}
              className="absolute top-4 right-4 text-navy-400 hover:text-navy-900 dark:hover:text-white p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-mono font-bold rounded-full border border-amber-500/20">
                Google Pay Payment Verified
              </span>
              <h3 className="text-xl font-black text-navy-900 dark:text-white font-display">
                Package Purchase Confirmed!
              </h3>
              <p className="text-xs text-navy-600 dark:text-navy-300">
                You have successfully purchased <b>{purchasedPackage.pkg.name}</b> (R{purchasedPackage.pkg.price} ZAR) via Google Pay.
              </p>
            </div>

            <div className="p-3.5 bg-navy-50 dark:bg-navy-950 rounded-xl text-left font-mono text-[11px] space-y-1.5 border border-navy-150 dark:border-navy-800">
              <div className="flex justify-between text-navy-500">
                <span>Merchant:</span>
                <span className="font-bold text-navy-900 dark:text-white">Amaris Learning Hub</span>
              </div>
              <div className="flex justify-between text-navy-500">
                <span>Merchant ID:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">BCR2DN7TRHFIFPYC</span>
              </div>
              <div className="flex justify-between text-navy-500">
                <span>Transaction Ref:</span>
                <span className="font-bold text-navy-900 dark:text-white truncate max-w-[180px]">{purchasedPackage.txId}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setPurchasedPackage(null);
                  navigate(`/book?package=${purchasedPackage.pkg.id}`);
                }}
                className="w-full py-3 bg-royal-600 hover:bg-royal-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>Schedule Your Lessons Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setPurchasedPackage(null)}
                className="w-full py-2.5 bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 text-navy-700 dark:text-navy-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Close & View Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NO RISK GUARANTEE */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-navy-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 border border-navy-800">
          <div className="p-3 bg-royal-600/30 text-gold-400 rounded-xl h-12 w-12 flex items-center justify-center flex-shrink-0">
            <Info className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Amaris Learner Satisfaction Guarantee</h3>
            <p className="text-xs text-navy-300">
              Not sure if online tutoring is for you? Book any package with complete peace of mind. If you are not completely satisfied after your very first hour, let us know and we will fully refund your remaining package balance immediately.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
