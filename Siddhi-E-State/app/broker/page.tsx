"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaUserTie,
  FaHome,
  FaBuilding,
  FaStar,
  FaCheckCircle,
} from "react-icons/fa";
import Navbar from "../components/navabar/page";
import { useForm } from "react-hook-form";
import api from "@/utils/api";

interface Broker {
  _id: string;
  name: string;
  location: string;
  phone: string;
  email: string;
  verified: boolean;
  rating: number;
  totalDeals: number;
  experience: number;
  profileImage?: string;
  cities: string[];
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  location: string;
  cities: string;
  licenseNumber?: string;
  experience?: number;
}

export default function BrokerPage() {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [connectMessage, setConnectMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>();

  // Fetch brokers with pagination
  const fetchBrokers = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<Broker[]>>("/brokers", {
        params: {
          page,
          limit: 6,
          verified: "true",
          status: "active",
          sortBy: "createdAt",
          sortOrder: "desc",
        },
      });
      
      if (response.data.success && response.data.data) {
        setBrokers(response.data.data);
        if (response.data.meta) {
          setTotalPages(response.data.meta.totalPages);
        }
      }
    } catch (error) {
      console.error("Failed to fetch brokers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await api.get<ApiResponse<any>>("/brokers/stats");
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  useEffect(() => {
    fetchBrokers(currentPage);
    fetchStats();
  }, [currentPage]);

  const onSubmit = async (data: FormData) => {
    try {
      // Transform cities from comma-separated string to array
      const citiesArray = data.cities.split(",").map(city => city.trim());
      
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        location: data.location,
        cities: citiesArray,
        licenseNumber: data.licenseNumber,
        experience: data.experience || 0,
        commission: 2, // default commission
      };

      const response = await api.post<ApiResponse<Broker>>("/brokers", payload);
      
      if (response.data.success) {
        setConnectMessage("Registration successful! Our team will verify your details.");
        reset();
        // Refresh brokers list
        fetchBrokers(currentPage);
        fetchStats();
        
        // Clear message after 5 seconds
        setTimeout(() => setConnectMessage(""), 5000);
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Registration failed. Try again later.";
      setConnectMessage(errorMsg);
      setTimeout(() => setConnectMessage(""), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f1dd] text-gray-900">
      <div className="bg-[#f9f1dd] py-4 px-4 sm:px-6 text-gray-900">
        <Navbar />
        <div className="max-w-6xl mx-auto py-16 px-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-10 text-center">
            Verified Brokers – Virar to Churchgate
          </h1>

          {/* Stats Section */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <div className="bg-white rounded-lg p-4 text-center shadow">
                <div className="text-2xl font-bold text-[#d6a243]">{stats.total || 0}</div>
                <div className="text-sm text-gray-600">Total Brokers</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow">
                <div className="text-2xl font-bold text-[#d6a243]">{stats.verified || 0}</div>
                <div className="text-sm text-gray-600">Verified Brokers</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow">
                <div className="text-2xl font-bold text-[#d6a243]">{stats.byStatus?.active || 0}</div>
                <div className="text-sm text-gray-600">Active Brokers</div>
              </div>
            </div>
          )}

          {/* Brokers Grid */}
          {loading ? (
            <div className="text-center py-12">Loading brokers...</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {brokers.map((broker) => (
                <div
                  key={broker._id}
                  className="bg-white rounded-xl p-6 shadow hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <FaUserTie className="text-[#d6a243] text-xl mr-2" />
                      <h2 className="text-xl font-semibold text-gray-800">
                        {broker.name}
                      </h2>
                    </div>
                    {broker.verified && (
                      <FaCheckCircle className="text-green-500 text-lg" />
                    )}
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-1 rounded">
                      Deals closed: {broker.totalDeals}
                    </span>
                  </div>

                  <div className="space-y-1 text-gray-700">
                    <p className="flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-gray-500" />
                      {broker.location}
                    </p>
                    <p className="flex items-center">
                      <FaPhone className="mr-2 text-gray-500" />
                      {broker.phone}
                    </p>
                    <p className="flex items-center">
                      <FaEnvelope className="mr-2 text-gray-500" />
                      {broker.email}
                    </p>
                    {broker.cities && broker.cities.length > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Services: {broker.cities.slice(0, 3).join(", ")}
                        {broker.cities.length > 3 && "..."}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-2 mb-16">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-1 rounded bg-yellow-100 text-[#d6a243] hover:bg-yellow-200 disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-1 rounded ${
                    currentPage === i + 1
                      ? "bg-[#d6a243] text-white"
                      : "bg-yellow-100 text-[#d6a243] hover:bg-yellow-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-1 rounded bg-yellow-100 text-[#d6a243] hover:bg-yellow-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

          {/* Registration Form */}
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
            Register as a Broker
          </h2>
          <section className="py-2 px-6 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
              <div className="md:flex items-center">
                <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {connectMessage && (
                      <p className={`font-medium text-center ${
                        connectMessage.includes("successful") 
                          ? "text-green-600" 
                          : "text-red-600"
                      }`}>
                        {connectMessage}
                      </p>
                    )}

                    {/* Name */}
                    <div>
                      <label className="block font-medium text-gray-800 mb-1">Name*</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUserTie className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          {...register("name", { required: "Name is required" })}
                          className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#d6a243]"
                        />
                      </div>
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block font-medium text-gray-800 mb-1">Phone*</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaPhone className="text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          {...register("phone", { 
                            required: "Phone is required",
                            pattern: {
                              value: /^[0-9]{10}$/,
                              message: "Phone number must be 10 digits"
                            }
                          })}
                          className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#d6a243]"
                        />
                      </div>
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block font-medium text-gray-800 mb-1">Email*</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaEnvelope className="text-gray-400" />
                        </div>
                        <input
                          type="email"
                          {...register("email", { 
                            required: "Email is required",
                            pattern: {
                              value: /^\S+@\S+\.\S+$/,
                              message: "Please enter a valid email"
                            }
                          })}
                          className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#d6a243]"
                        />
                      </div>
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block font-medium text-gray-800 mb-1">Primary Location*</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaMapMarkerAlt className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          {...register("location", { required: "Location is required" })}
                          className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#d6a243]"
                        />
                      </div>
                      {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
                    </div>

                    {/* Cities (comma-separated) */}
                    <div>
                      <label className="block font-medium text-gray-800 mb-1">
                        Cities Served* <span className="text-xs text-gray-500">(comma-separated)</span>
                      </label>
                      <input
                        type="text"
                        {...register("cities", { required: "At least one city is required" })}
                        placeholder="e.g., Virar, Borivali, Andheri"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#d6a243]"
                      />
                      {errors.cities && <p className="text-red-500 text-sm mt-1">{errors.cities.message}</p>}
                    </div>

                    {/* License Number (Optional) */}
                    <div>
                      <label className="block font-medium text-gray-800 mb-1">License Number <span className="text-xs text-gray-500">(Optional)</span></label>
                      <input
                        type="text"
                        {...register("licenseNumber")}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#d6a243]"
                      />
                    </div>

                    {/* Experience (Optional) */}
                    <div>
                      <label className="block font-medium text-gray-800 mb-1">Experience (Years)</label>
                      <input
                        type="number"
                        {...register("experience", { min: 0, max: 50 })}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#d6a243]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#d6a243] text-white font-semibold py-3 rounded hover:bg-[#b48735] transition disabled:opacity-50"
                    >
                      {isSubmitting ? "Submitting..." : "Register as Broker"}
                    </button>
                  </form>
                </div>

                <div className="md:w-1/2">
                  <Image
                    src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80"
                    alt="Broker Registration"
                    width={600}
                    height={400}
                    className="rounded-lg shadow-md w-full border border-[#d6a243]/20 object-cover"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}