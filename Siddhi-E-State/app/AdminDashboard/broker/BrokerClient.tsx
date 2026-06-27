"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

interface Broker {
  _id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  verified: boolean;
  kycStatus: "pending" | "verified" | "rejected";
  status: "active" | "inactive" | "suspended";
  totalDeals: number;
  experience: number;
  commission: number;
  cities: string[];
  alternatePhone?: string;
  licenseNumber?: string;
  bio?: string;
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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

interface BrokerClientProps {
  initialBrokers: Broker[];
  initialTotalPages: number;
  initialStats: any;
}

const AdminBrokerPage = ({ initialBrokers, initialTotalPages, initialStats }: BrokerClientProps) => {
  const [brokers, setBrokers] = useState<Broker[]>(initialBrokers);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    verified: "",
    kycStatus: "",
    search: "",
  });
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState<any>(initialStats);
  
  const isMounted = useRef(false);

  const brokersPerPage = 8;

  const fetchBrokers = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: brokersPerPage,
        sortBy: "createdAt",
        sortOrder: "desc",
      };
      
      if (filters.status) params.status = filters.status;
      if (filters.verified === "true") params.verified = true;
      if (filters.verified === "false") params.verified = false;
      if (filters.kycStatus) params.kycStatus = filters.kycStatus;
      if (filters.search) params.search = filters.search;

      const response = await axios.get<ApiResponse<Broker[]>>(
        `${API_BASE}/brokers`,
        { params }
      );
      
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

  const fetchStats = async () => {
    try {
      const response = await axios.get<ApiResponse<any>>(`${API_BASE}/brokers/stats`);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    fetchBrokers(currentPage);
    fetchStats();
  }, [currentPage, filters]);

  const updateBroker = async (id: string, updates: Partial<Broker>) => {
    try {
      const response = await axios.put<ApiResponse<Broker>>(
        `${API_BASE}/brokers/${id}`,
        updates
      );
      if (response.data.success) {
        fetchBrokers(currentPage);
        fetchStats();
        alert("Broker updated successfully!");
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update broker");
    }
  };

  const verifyBrokerKYC = async (id: string, kycStatus: "verified" | "rejected") => {
    try {
      const response = await axios.patch<ApiResponse<Broker>>(
        `${API_BASE}/brokers/${id}/verify`,
        { 
          kycStatus,
          verified: kycStatus === "verified"
        }
      );
      if (response.data.success) {
        fetchBrokers(currentPage);
        fetchStats();
        alert(`Broker ${kycStatus} successfully!`);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to verify broker");
    }
  };

  const deleteBroker = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this broker? This action cannot be undone.")) return;
    try {
      const response = await axios.delete<ApiResponse<any>>(`${API_BASE}/brokers/${id}`);
      if (response.data.success) {
        fetchBrokers(currentPage);
        fetchStats();
        alert("Broker deleted successfully");
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete broker");
    }
  };

  const getKYCStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-700",
      verified: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-700",
      inactive: "bg-gray-100 text-gray-700",
      suspended: "bg-red-100 text-red-700",
    };
    return colors[status as keyof typeof colors] || colors.active;
  };

  return (
    <div className="p-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
            <div className="text-2xl font-bold">{stats.total || 0}</div>
            <div className="text-sm text-gray-600">Total Brokers</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
            <div className="text-2xl font-bold">{stats.verified || 0}</div>
            <div className="text-sm text-gray-600">Verified</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
            <div className="text-2xl font-bold">{stats.unverified || 0}</div>
            <div className="text-sm text-gray-600">Unverified</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
            <div className="text-2xl font-bold">{stats.byStatus?.active || 0}</div>
            <div className="text-sm text-gray-600">Active Brokers</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search by name, location..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="border p-2 rounded text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border p-2 rounded text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          <select
            value={filters.verified}
            onChange={(e) => setFilters({ ...filters, verified: e.target.value })}
            className="border p-2 rounded text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <option value="">All Verification</option>
            <option value="true">Verified</option>
            <option value="false">Not Verified</option>
          </select>
          <select
            value={filters.kycStatus}
            onChange={(e) => setFilters({ ...filters, kycStatus: e.target.value })}
            className="border p-2 rounded text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <option value="">All KYC Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Brokers Table */}
      <div className="overflow-x-auto shadow rounded-lg border bg-white">
        {loading ? (
          <div className="text-center py-12">Loading brokers...</div>
        ) : (
          <>
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-800 font-semibold">
                <tr>
                  <th className="px-4 py-3 border">Name</th>
                  <th className="px-4 py-3 border">Contact</th>
                  <th className="px-4 py-3 border">Location</th>
                  <th className="px-4 py-3 border">Cities</th>
                  <th className="px-4 py-3 border">Deals</th>
                  <th className="px-4 py-3 border">Status</th>
                  <th className="px-4 py-3 border">KYC</th>
                  <th className="px-4 py-3 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {brokers.map((broker) => (
                  <tr key={broker._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      {broker.name}
                      {broker.experience > 0 && (
                        <div className="text-xs text-gray-500">{broker.experience} yrs exp</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div>{broker.phone}</div>
                      <div className="text-xs text-gray-500">{broker.email}</div>
                    </td>
                    <td className="px-4 py-3">{broker.location}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs">
                        {broker.cities?.slice(0, 2).join(", ")}
                        {broker.cities?.length > 2 && "..."}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{broker.totalDeals || 0} deals</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(broker.status)}`}>
                        {broker.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getKYCStatusBadge(broker.kycStatus)}`}>
                        {broker.kycStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedBroker(broker);
                          setShowDetailsModal(true);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                      >
                        View
                      </button>
                      <select
                        onChange={(e) => {
                          if (e.target.value === "verify") verifyBrokerKYC(broker._id, "verified");
                          else if (e.target.value === "reject") verifyBrokerKYC(broker._id, "rejected");
                          else if (e.target.value === "active") updateBroker(broker._id, { status: "active" });
                          else if (e.target.value === "inactive") updateBroker(broker._id, { status: "inactive" });
                          else if (e.target.value === "suspended") updateBroker(broker._id, { status: "suspended" });
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                        defaultValue=""
                      >
                        <option value="" disabled>Actions</option>
                        <option value="verify">✓ Verify KYC</option>
                        <option value="reject">✗ Reject KYC</option>
                        <option value="active">Set Active</option>
                        <option value="inactive">Set Inactive</option>
                        <option value="suspended">Suspend</option>
                      </select>
                      <button
                        onClick={() => deleteBroker(broker._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-4 gap-2 p-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded ${
                      currentPage === i + 1
                        ? "bg-red-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedBroker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Broker Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-3">
                <div><strong>Name:</strong> {selectedBroker.name}</div>
                <div><strong>Email:</strong> {selectedBroker.email}</div>
                <div><strong>Phone:</strong> {selectedBroker.phone}</div>
                {selectedBroker.alternatePhone && <div><strong>Alternate Phone:</strong> {selectedBroker.alternatePhone}</div>}
                <div><strong>Location:</strong> {selectedBroker.location}</div>
                <div><strong>Cities Served:</strong> {selectedBroker.cities?.join(", ")}</div>
                {selectedBroker.licenseNumber && <div><strong>License Number:</strong> {selectedBroker.licenseNumber}</div>}
                <div><strong>Experience:</strong> {selectedBroker.experience} years</div>
                <div><strong>Commission:</strong> {selectedBroker.commission}%</div>
                <div><strong>Total Deals:</strong> {selectedBroker.totalDeals}</div>
                <div><strong>KYC Status:</strong> 
                  <span className={`ml-2 inline-block px-2 py-1 rounded-full text-xs font-medium ${getKYCStatusBadge(selectedBroker.kycStatus)}`}>
                    {selectedBroker.kycStatus}
                  </span>
                </div>
                <div><strong>Status:</strong>
                  <span className={`ml-2 inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedBroker.status)}`}>
                    {selectedBroker.status}
                  </span>
                </div>
                {selectedBroker.bio && <div><strong>Bio:</strong> {selectedBroker.bio}</div>}
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => verifyBrokerKYC(selectedBroker._id, "verified")}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Verify KYC
                </button>
                <button
                  onClick={() => verifyBrokerKYC(selectedBroker._id, "rejected")}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Reject KYC
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBrokerPage;