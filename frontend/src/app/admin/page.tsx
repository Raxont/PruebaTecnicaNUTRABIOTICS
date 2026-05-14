'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { MetricsResponse } from '@/lib/types';
import ProtectedPage from '@/components/ProtectedPage';
import SiteHeader from '@/components/SiteHeader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminPage() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<MetricsResponse>('/admin/metrics')
      .then(setMetrics)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <ProtectedPage allowedRoles={['ADMIN']}>
      <main className="main-shell">
        <SiteHeader />
        <div className="topbar">
          <div>
            <h1 className="page-title">Dashboard de Administrador</h1>
            <p>Resumen de pacientes, médicos y prescripciones.</p>
          </div>
        </div>

        {error && <div className="alert">{error}</div>}

        <div className="grid grid-3" style={{ marginBottom: 18 }}>
          <div className="card">
            <h2 className="section-title">Pacientes</h2>
            <p>{metrics?.totalPatients ?? '...'}</p>
          </div>
          <div className="card">
            <h2 className="section-title">Médicos</h2>
            <p>{metrics?.totalDoctors ?? '...'}</p>
          </div>
          <div className="card">
            <h2 className="section-title">Prescripciones</h2>
            <p>{metrics?.totalPrescriptions ?? '...'}</p>
          </div>
        </div>

        <div className="grid grid-2">
          <div className="card">
            <h2 className="section-title">Por estado</h2>
            <div className="page-actions">
              <span className="status-pill status-pending">Pendientes: {metrics?.prescriptionsByStatus.pending ?? '...'}</span>
              <span className="status-pill status-consumed">Consumidas: {metrics?.prescriptionsByStatus.consumed ?? '...'}</span>
            </div>
          </div>
          <div className="card">
            <h2 className="section-title">Serie por día</h2>
            {metrics?.prescriptionsByDay ? (
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <LineChart data={metrics.prescriptionsByDay} margin={{ top: 10, right: 15, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p>Cargando datos...</p>
            )}
          </div>
        </div>
      </main>
    </ProtectedPage>
  );
}
