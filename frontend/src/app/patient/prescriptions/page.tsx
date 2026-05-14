'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Prescription } from '@/lib/types';
import ProtectedPage from '@/components/ProtectedPage';
import SiteHeader from '@/components/SiteHeader';

export default function PatientPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadPrescriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<{ data: Prescription[] }>('/me/prescriptions');
      setPrescriptions(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar prescripciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const consumePrescription = async (id: string) => {
    setError(null);
    try {
      await apiFetch<Prescription>(`/prescriptions/${id}/consume`, { method: 'PUT' });
      await loadPrescriptions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al marcar como consumida');
    }
  };

  return (
    <ProtectedPage allowedRoles={['PATIENT']}>
      <main className="main-shell">
        <SiteHeader />
        <div className="topbar">
          <div>
            <h1 className="page-title">Mis prescripciones</h1>
            <p>Consulta tus recetas y gestiona el estado de consumo.</p>
          </div>
        </div>

        {error && <div className="alert">{error}</div>}

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4}>Cargando...</td>
                </tr>
              ) : prescriptions.length === 0 ? (
                <tr>
                  <td colSpan={4}>No hay prescripciones disponibles.</td>
                </tr>
              ) : (
                prescriptions.map((prescription) => (
                  <tr key={prescription.id}>
                    <td>{prescription.code}</td>
                    <td>
                      <span className={`status-pill ${prescription.status === 'CONSUMED' ? 'status-consumed' : 'status-pending'}`}>
                        {prescription.status.toLowerCase()}
                      </span>
                    </td>
                    <td>{new Date(prescription.createdAt).toLocaleDateString('es-ES')}</td>
                    <td className="page-actions">
                      <Link className="button button-secondary" href={`/patient/prescriptions/${prescription.id}`}>
                        Ver
                      </Link>
                      <a
                        className="button button-primary"
                        href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/prescriptions/${prescription.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        PDF
                      </a>
                      {prescription.status === 'PENDING' && (
                        <button className="button button-secondary" type="button" onClick={() => consumePrescription(prescription.id)}>
                          Marcar consumida
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </ProtectedPage>
  );
}
