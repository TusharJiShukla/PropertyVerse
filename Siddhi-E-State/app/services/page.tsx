"use client";

import React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader } from "lucide-react";
import Navbar from "../components/navabar/page";
import { useForm } from "react-hook-form";
import Footer from "../components/footer/page";
import api from "@/utils/api";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type Properties = {
  _id: string;
  title: string;
  location: string;
  city: string;
  image: string;
  originalPrice: number;
  discountedPrice: number;
  area: number;
  areaUnit: string;
  type: string;
};

type QueryForm = {
  fullName: string;
  email: string;
  phone: string;
  query: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export default function ServicesPage() {
  const [properties, setProperties] = useState<Properties[]>([]);
  const [loading, setLoading] = useState(true);
  const [loanAmount, setLoanAmount] = useState<number | null>(null);
  const [interestRate, setInterestRate] = useState<number | null>(null);
  const [loanTenure, setLoanTenure] = useState<number | null>(null);
  const [emi, setEmi] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [inquiryId, setInquiryId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QueryForm>();

  const onSubmit = async (data: QueryForm) => {
    try {
      setError(null);
      setSuccessMessage(null);
      
      // Validate phone number (10 digits)
      if (!/^\d{10}$/.test(data.phone)) {
        setError("Please enter a valid 10-digit phone number");
        return;
      }

      const payload = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        businessName: "Service Inquiry",
        businessDesc: "Property consultation request from Services page",
        inquiryType: "general",
        service: "property_consultation",
        projectDesc: data.query,
        websiteType: "other",
        existingWebsite: "",
        existingDesc: "",
      };

      const response = await api.post<ApiResponse<any>>("/send-email", payload);
      
      if (response.data.success) {
        reset();
        setSuccessMessage(response.data.message || "Thank you! Our expert will contact you within 24 hours.");
        setInquiryId(response.data.data?.inquiryId || null);
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage(null);
          setInquiryId(null);
        }, 5000);
      } else {
        setError(response.data.message || "Failed to send message. Please try again.");
      }
    } catch (err: unknown) {
      console.error("Error occurred while sending:", err);
      setError("Failed to send message. Please try again later.");
    }
  };

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const response = await api.get<ApiResponse<Properties[]>>("/properties", {
          params: {
            limit: 6,
            sortBy: "discountedPrice",
            sortOrder: "asc",
          }
        });
        
        if (response.data.success && response.data.data) {
          // Get properties with discount and limit to 3
          const discounted = response.data.data
            .filter((prop: Properties) => prop.discountedPrice < prop.originalPrice)
            .slice(0, 3);
          setProperties(discounted);
        } else {
          setProperties([]);
        }
      } catch (error: unknown) {
        console.error("Failed to fetch properties:", error);
        setError("Failed to fetch properties. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const calculateEMI = () => {
    if (!loanAmount || !interestRate || !loanTenure) {
      setEmi(null);
      return;
    }

    const principal = loanAmount;
    const annualInterestRate = interestRate / 100;
    const monthlyInterestRate = annualInterestRate / 12;
    const totalMonths = loanTenure * 12;

    const emiCalc =
      (principal *
        monthlyInterestRate *
        Math.pow(1 + monthlyInterestRate, totalMonths)) /
      (Math.pow(1 + monthlyInterestRate, totalMonths) - 1);

    setEmi(Number.isFinite(emiCalc) ? Math.round(emiCalc) : null);
  };

  // Format price in Crores/Lakhs
  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `${(price / 10000000).toFixed(2)}Cr`;
    } else if (price >= 100000) {
      return `${(price / 100000).toFixed(2)}L`;
    }
    return price.toLocaleString();
  };

  // Calculate discount percentage
  const getDiscountPercent = (original: number, discounted: number) => {
    if (original === 0) return 0;
    return Math.round(((original - discounted) / original) * 100);
  };

  return (
    <div className="min-h-screen bg-[#f9f1dd] text-gray-900">
      <div className="bg-[#f9f1dd] py-4 px-4 sm:px-6 text-gray-900">
        <Navbar />
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-[#d6a243] mb-6">
            Our Services
          </h1>
          <p className="text-gray-800 mb-8 text-base md:text-lg">
            Explore our range of real estate services, including discounted property listings and expert consultation.
          </p>

          {/* Discounted Properties Section */}
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader className="animate-spin text-[#d6a243]" />
              <span className="ml-3 text-gray-600">Loading properties...</span>
            </div>
          ) : properties.length > 0 ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Hot Deals 🔥</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((prop) => (
                  <div
                    key={prop._id}
                    className="rounded-2xl shadow-md hover:shadow-xl transition duration-300 bg-white overflow-hidden group"
                  >
                    <div className="relative">
                      <Image
                        src={prop.image}
                        alt={prop.title}
                        width={400}
                        height={250}
                        className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {getDiscountPercent(prop.originalPrice, prop.discountedPrice)}% OFF
                      </div>
                    </div>
                    <div className="p-4">
                      <h2 className="text-lg font-semibold text-gray-900 mb-1">
                        {prop.title}
                      </h2>
                      <p className="text-sm text-gray-700 mb-1">
                        {prop.location}, {prop.city}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        Area: {prop.area} {prop.areaUnit} • {prop.type}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 line-through text-sm">
                          {formatPrice(prop.originalPrice)}
                        </span>
                        <span className="text-[#d6a243] font-bold text-lg">
                          {formatPrice(prop.discountedPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <p className="text-gray-600">No discounted properties available at the moment.</p>
            </div>
          )}

          {/* Ask a Property Expert Section */}
          <div className="mt-16 bg-white rounded-2xl shadow-md p-6 md:p-10">
            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 rounded-lg p-4 mb-4">
                <p className="font-medium">{successMessage}</p>
                {inquiryId && (
                  <p className="text-sm mt-1">Reference ID: {inquiryId}</p>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 rounded-lg p-4 mb-4">
                {error}
              </div>
            )}

            <h2 className="text-2xl md:text-3xl font-bold text-[#d6a243] mb-4">
              Ask a Property Expert
            </h2>
            <p className="text-gray-700 mb-6 text-base">
              Have questions about buying property or planning investments?
              Reach out to our expert advisors.
            </p>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  {...register("fullName", { required: "Full name is required" })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d6a243] text-gray-900"
                  placeholder="John Doe"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  {...register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: "Please enter a valid email address",
                    }
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d6a243] text-gray-900"
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number * (10 digits)
                </label>
                <input
                  type="tel"
                  {...register("phone", { 
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Please enter a valid 10-digit phone number",
                    }
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d6a243] text-gray-900"
                  placeholder="9876543210"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Query *
                </label>
                <textarea
                  {...register("query", {
                    required: "Please enter your query",
                    minLength: {
                      value: 10,
                      message: "Please provide at least 10 characters",
                    }
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d6a243] text-gray-900"
                  placeholder="Describe your property requirements or questions..."
                  rows={5}
                />
                {errors.query && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.query.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 px-6 py-2 bg-[#d6a243] text-white font-semibold rounded-xl shadow hover:bg-[#c2913a] transition disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Query"}
              </button>
            </form>
          </div>

          {/* Home Loan Calculator Section */}
          <div className="mt-16 bg-white rounded-2xl shadow-md p-6 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#d6a243] mb-4">
              Home Loan Calculator
            </h2>
            <p className="text-gray-700 mb-6 text-base">
              Use this tool to get an estimated EMI (Equated Monthly
              Installment) based on your loan preferences.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Amount (₹)
                </label>
                <input
                  type="number"
                  value={loanAmount ?? ""}
                  onChange={(e) =>
                    setLoanAmount(e.target.value ? Number(e.target.value) : null)
                  }
                  placeholder="e.g., 5000000"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d6a243] text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interest Rate (% per annum)
                </label>
                <input
                  type="number"
                  value={interestRate ?? ""}
                  onChange={(e) =>
                    setInterestRate(e.target.value ? Number(e.target.value) : null)
                  }
                  step="0.01"
                  placeholder="e.g., 8.5"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d6a243] text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Tenure (Years)
                </label>
                <input
                  type="number"
                  value={loanTenure ?? ""}
                  onChange={(e) =>
                    setLoanTenure(e.target.value ? Number(e.target.value) : null)
                  }
                  placeholder="e.g., 20"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d6a243] text-gray-900"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <button
                type="button"
                onClick={calculateEMI}
                className="px-6 py-2 bg-[#d6a243] text-white font-semibold rounded-xl shadow hover:bg-[#c2913a] transition"
              >
                Calculate EMI
              </button>
            </div>

            {emi !== null && (
              <div className="mt-6 bg-[#fef7e7] border border-[#d6a243] text-gray-900 p-4 rounded-lg shadow-sm">
                <p className="font-semibold text-lg">
                  Estimated Monthly EMI:{" "}
                  <span className="text-[#d6a243] text-2xl font-bold">
                    ₹{emi.toLocaleString()}
                  </span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  *This is an estimated amount. Actual EMI may vary based on bank policies.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}