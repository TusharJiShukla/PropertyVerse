"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Banknote,
  Home,
  Landmark,
  Hammer,
  FileText,
  Phone,
  Calculator,
  CircleDotDashed,
} from "lucide-react";
import Navbar from "../components/navabar/page";
import axios from "axios";

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: {
    inquiryId: string;
    status: string;
  };
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export default function LoansLegalPage() {
  const [emi, setEmi] = useState<number | null>(null);
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [tenure, setTenure] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [inquiryId, setInquiryId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [legalIssue, setLegalIssue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const calculateEMI = () => {
    const P = parseFloat(loanAmount);
    const R = parseFloat(interestRate) / 12 / 100;
    const N = parseFloat(tenure) * 12;

    if (!P || !R || !N) return;
    const emiValue = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
    setEmi(Math.round(emiValue));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setErrorMessage("");

    // Validate phone number
    if (!/^\d{10}$/.test(phone)) {
      setErrorMessage("Please enter a valid 10-digit phone number");
      setIsSubmitting(false);
      return;
    }

    // Validate email
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrorMessage("Please enter a valid email address");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post<ApiResponse>(`${API_BASE}/send-email`, {
        fullName,
        email,
        phone,
        businessName: "Legal Assistance",
        businessDesc: "Legal callback request from Loans & Legal page",
        inquiryType: "support",  // ✅ valid enum: "general", "property", "partnership", "support", "feedback"
        service: "consulting",    // ✅ valid enum: "website", "marketing", "consulting", "other"
        projectDesc: legalIssue,
        websiteType: "other",
        existingWebsite: "",
        existingDesc: "Legal consultation request",
      });

      if (response.data.success) {
        setFormSubmitted(true);
        setInquiryId(response.data.data?.inquiryId || null);
        // Reset form
        setFullName("");
        setPhone("");
        setEmail("");
        setLegalIssue("");
      } else {
        setErrorMessage(response.data.message || "Failed to submit request");
      }
    } catch (error: any) {
      console.error("Email sending error:", error);
      setErrorMessage(
        error.response?.data?.message || 
        "Failed to send request. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f1dd] text-gray-900">
      <div className="bg-[#f9f1dd] py-4 px-4 sm:px-6 text-gray-900">
        <Navbar />
        <main className="bg-gradient-to-b from-amber-50 to-amber-100 text-amber-900">
          {/* Hero Section - Keep as is */}
          <section className="text-center py-20 px-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-wide">
                Loans & Legal Assistance
              </h1>
              <p className="text-xl text-amber-700 max-w-2xl mx-auto">
                Navigate your property journey with expert loan advice and legal
                clarity.
              </p>
            </motion.div>
          </section>

          {/* Rest of your sections remain exactly the same */}
          {/* Loan Options Section, Legal Guidance Section, Contact Section */}
          {/* ... keep everything else unchanged ... */}
          
          {/* Contact Section - The form part */}
          <section className="bg-amber-600 text-white py-20 px-6">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold mb-6">
                  Connect with Our Legal Experts
                </h2>
                <p className="text-xl mb-8 max-w-2xl mx-auto">
                  Got legal questions about loans, registration, or disputes?
                  Our experts will call you back.
                </p>

                {formSubmitted ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white text-amber-800 p-8 rounded-xl shadow-lg max-w-md mx-auto"
                  >
                    <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-4">
                      <h3 className="font-semibold text-lg">
                        ✓ Request Received!
                      </h3>
                    </div>
                    <p className="mb-4">
                      Our legal team will contact you within 24 hours.
                    </p>
                    {inquiryId && (
                      <p className="text-sm text-amber-600 mb-4">
                        Reference ID: {inquiryId}
                      </p>
                    )}
                    <p className="text-sm">
                      For urgent matters, call our helpline:{" "}
                      <span className="font-bold">1800-123-4567</span>
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    onSubmit={handleSubmit}
                    className="bg-white text-amber-900 p-8 rounded-xl shadow-lg max-w-md mx-auto text-left space-y-4"
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                  >
                    {errorMessage && (
                      <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
                        {errorMessage}
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full p-3 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Contact Number * (10 digits)
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d*$/.test(value) && value.length <= 10) {
                            setPhone(value);
                          }
                        }}
                        className="w-full p-3 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        required
                        maxLength={10}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Legal Issue / Query *
                      </label>
                      <textarea
                        value={legalIssue}
                        onChange={(e) => setLegalIssue(e.target.value)}
                        className="w-full p-3 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        rows={4}
                        required
                        placeholder="Please describe your legal issue or question..."
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 mt-4 ${
                        isSubmitting
                          ? "bg-amber-400 cursor-not-allowed"
                          : "bg-amber-600 hover:bg-amber-700 text-white"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <CircleDotDashed className="animate-spin" size={18} />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Phone size={18} />
                          Request Callback
                        </>
                      )}
                    </button>
                    
                    <p className="text-xs text-amber-600 text-center mt-4">
                      By submitting, you agree to our terms and privacy policy.
                      We'll contact you within 24 hours.
                    </p>
                  </motion.form>
                )}
              </motion.div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}