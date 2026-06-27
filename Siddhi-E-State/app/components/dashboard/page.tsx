"use client";

import React, { useEffect, useState } from "react";
import DashboardCard from "../../components/dashboard/DashboardCard";
import { 
  DollarSign, 
  Users, 
  ShoppingCart, 
  TrendingUp,
  Home,
  Building,
  FileText,
  PhoneCall
} from "lucide-react";
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

type DashboardStats = {
  totalProperties: number;
  availableProperties: number;
  soldProperties: number;
  pendingProperties: number;
  totalBrokers: number;
  verifiedBrokers: number;
  totalInquiries: number;
  pendingInquiries: number;
  totalRequirements: number;
  openRequirements: number;
  revenue?: number;
  growth?: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    availableProperties: 0,
    soldProperties: 0,
    pendingProperties: 0,
    totalBrokers: 0,
    verifiedBrokers: 0,
    totalInquiries: 0,
    pendingInquiries: 0,
    totalRequirements: 0,
    openRequirements: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch property stats
        const propertyStatsRes = await api.get<ApiResponse<any>>("/properties/stats");
        // Fetch broker stats
        const brokerStatsRes = await api.get<ApiResponse<any>>("/brokers/stats");
        // Fetch inquiries
        const inquiriesRes = await api.get<ApiResponse<any>>("/inquiries", {
          params: { limit: 1 }
        });
        // Fetch requirements stats
        const requirementsStatsRes = await api.get<ApiResponse<any>>("/property-requirements/stats");

        const propertyStats = propertyStatsRes.data.success ? propertyStatsRes.data.data : null;
        const brokerStats = brokerStatsRes.data.success ? brokerStatsRes.data.data : null;
        const inquiries = inquiriesRes.data.success ? inquiriesRes.data.data : [];
        const requirementsStats = requirementsStatsRes.data.success ? requirementsStatsRes.data.data : null;

        setStats({
          totalProperties: propertyStats?.total || 0,
          availableProperties: propertyStats?.byAvailability?.available || 0,
          soldProperties: propertyStats?.byAvailability?.sold || 0,
          pendingProperties: propertyStats?.byAvailability?.pending || 0,
          totalBrokers: brokerStats?.total || 0,
          verifiedBrokers: brokerStats?.verified || 0,
          totalInquiries: inquiriesRes.data.meta?.total || 0,
          pendingInquiries: inquiries?.filter((i: any) => i.status === "pending").length || 0,
          totalRequirements: requirementsStats?.total || 0,
          openRequirements: requirementsStats?.byStatus?.open || 0,
          revenue: 12500000, // Example data - replace with actual API
          growth: 15, // Example data - replace with actual API
        });
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError("Failed to load dashboard data. Please try again later.");
        
        // Set fallback demo data for development
        setStats({
          totalProperties: 45,
          availableProperties: 28,
          soldProperties: 12,
          pendingProperties: 5,
          totalBrokers: 18,
          verifiedBrokers: 12,
          totalInquiries: 234,
          pendingInquiries: 45,
          totalRequirements: 67,
          openRequirements: 34,
          revenue: 12500000,
          growth: 15,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Format currency in Indian format
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#d6a243]"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-2xl mx-auto">
          <p className="font-medium">Error</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your business today.</p>
        </div>

        {/* Property Stats Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Home size={20} className="text-[#d6a243]" />
            Property Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard 
              title="Total Properties" 
              value={stats.totalProperties} 
              icon={<Home size={24} />}
              trend={{ value: 8, isPositive: true }}
            />
            <DashboardCard 
              title="Available Properties" 
              value={stats.availableProperties} 
              icon={<Home size={24} />}
              bgColor="from-green-100 via-green-50 to-green-100"
              textColor="text-green-700"
            />
            <DashboardCard 
              title="Sold Properties" 
              value={stats.soldProperties} 
              icon={<Home size={24} />}
              bgColor="from-blue-100 via-blue-50 to-blue-100"
              textColor="text-blue-700"
            />
            <DashboardCard 
              title="Pending Properties" 
              value={stats.pendingProperties} 
              icon={<Home size={24} />}
              bgColor="from-yellow-100 via-yellow-50 to-yellow-100"
              textColor="text-yellow-700"
            />
          </div>
        </div>

        {/* Broker Stats Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users size={20} className="text-[#d6a243]" />
            Broker Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard 
              title="Total Brokers" 
              value={stats.totalBrokers} 
              icon={<Users size={24} />}
              trend={{ value: 12, isPositive: true }}
            />
            <DashboardCard 
              title="Verified Brokers" 
              value={stats.verifiedBrokers} 
              icon={<Users size={24} />}
              bgColor="from-green-100 via-green-50 to-green-100"
              textColor="text-green-700"
            />
            <DashboardCard 
              title="Unverified Brokers" 
              value={stats.totalBrokers - stats.verifiedBrokers} 
              icon={<Users size={24} />}
              bgColor="from-yellow-100 via-yellow-50 to-yellow-100"
              textColor="text-yellow-700"
            />
            <DashboardCard 
              title="Verification Rate" 
              value={`${Math.round((stats.verifiedBrokers / stats.totalBrokers) * 100)}%`} 
              icon={<TrendingUp size={24} />}
              bgColor="from-purple-100 via-purple-50 to-purple-100"
              textColor="text-purple-700"
            />
          </div>
        </div>

        {/* Inquiry & Requirements Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-[#d6a243]" />
            Customer Engagement
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard 
              title="Total Inquiries" 
              value={stats.totalInquiries} 
              icon={<PhoneCall size={24} />}
              trend={{ value: 23, isPositive: true }}
            />
            <DashboardCard 
              title="Pending Inquiries" 
              value={stats.pendingInquiries} 
              icon={<PhoneCall size={24} />}
              bgColor="from-yellow-100 via-yellow-50 to-yellow-100"
              textColor="text-yellow-700"
            />
            <DashboardCard 
              title="Total Requirements" 
              value={stats.totalRequirements} 
              icon={<FileText size={24} />}
              trend={{ value: 18, isPositive: true }}
            />
            <DashboardCard 
              title="Open Requirements" 
              value={stats.openRequirements} 
              icon={<FileText size={24} />}
              bgColor="from-green-100 via-green-50 to-green-100"
              textColor="text-green-700"
            />
          </div>
        </div>

        {/* Revenue Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign size={20} className="text-[#d6a243]" />
            Financial Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <DashboardCard 
              title="Total Revenue" 
              value={formatCurrency(stats.revenue || 0)} 
              icon={<DollarSign size={24} />}
              trend={{ value: stats.growth || 15, isPositive: true }}
              bgColor="from-emerald-100 via-emerald-50 to-emerald-100"
              textColor="text-emerald-700"
            />
            <DashboardCard 
              title="Average Property Value" 
              value={stats.totalProperties > 0 ? formatCurrency((stats.revenue || 0) / stats.totalProperties) : "₹0"} 
              icon={<TrendingUp size={24} />}
              bgColor="from-blue-100 via-blue-50 to-blue-100"
              textColor="text-blue-700"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <a 
              href="/admin/properties/new" 
              className="bg-white p-4 rounded-xl shadow hover:shadow-md transition text-center group"
            >
              <div className="bg-[#d6a243]/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#d6a243] transition">
                <Home size={24} className="text-[#d6a243] group-hover:text-white" />
              </div>
              <p className="font-medium text-gray-800">Add Property</p>
              <p className="text-sm text-gray-500">List a new property</p>
            </a>
            <a 
              href="/admin/brokers/new" 
              className="bg-white p-4 rounded-xl shadow hover:shadow-md transition text-center group"
            >
              <div className="bg-[#d6a243]/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#d6a243] transition">
                <Users size={24} className="text-[#d6a243] group-hover:text-white" />
              </div>
              <p className="font-medium text-gray-800">Add Broker</p>
              <p className="text-sm text-gray-500">Register a new broker</p>
            </a>
            <a 
              href="/admin/inquiries" 
              className="bg-white p-4 rounded-xl shadow hover:shadow-md transition text-center group"
            >
              <div className="bg-[#d6a243]/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#d6a243] transition">
                <PhoneCall size={24} className="text-[#d6a243] group-hover:text-white" />
              </div>
              <p className="font-medium text-gray-800">View Inquiries</p>
              <p className="text-sm text-gray-500">Check customer messages</p>
            </a>
            <a 
              href="/admin/redevelopment/new" 
              className="bg-white p-4 rounded-xl shadow hover:shadow-md transition text-center group"
            >
              <div className="bg-[#d6a243]/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#d6a243] transition">
                <Building size={24} className="text-[#d6a243] group-hover:text-white" />
              </div>
              <p className="font-medium text-gray-800">Add Project</p>
              <p className="text-sm text-gray-500">Add redevelopment project</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}