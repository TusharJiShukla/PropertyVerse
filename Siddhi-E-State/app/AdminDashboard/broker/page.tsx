import React, { Suspense } from "react";
import BrokerClient from "./BrokerClient";

export default async function AdminBrokerPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
  
  try {
    const [brokersRes, statsRes] = await Promise.all([
      fetch(`${baseUrl}/brokers?limit=8&sortBy=createdAt&sortOrder=desc`, { cache: 'no-store' }),
      fetch(`${baseUrl}/brokers/stats`, { cache: 'no-store' })
    ]);
    
    const brokersData = await brokersRes.json();
    const statsData = await statsRes.json();

    return (
      <Suspense fallback={<div className="text-center py-20 font-bold text-red-600">Loading Brokers...</div>}>
        <BrokerClient 
          initialBrokers={brokersData.data || []}
          initialTotalPages={brokersData.meta?.totalPages || 1}
          initialStats={statsData.data || null}
        />
      </Suspense>
    );
  } catch (error) {
    console.error("Failed to fetch admin brokers", error);
    return (
      <Suspense fallback={<div className="text-center py-20 text-red-600">Error Loading Brokers</div>}>
        <BrokerClient 
          initialBrokers={[]}
          initialTotalPages={1}
          initialStats={null}
        />
      </Suspense>
    );
  }
}
