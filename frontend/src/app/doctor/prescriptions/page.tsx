'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Prescription } from '@/lib/types';
import ProtectedPage from '@/components/ProtectedPage';
import SiteHeader from '@/components/SiteHeader';

export default function DoctorPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: Prescription[] }>('/prescriptions')
      .then((result) => setPrescriptions(result.data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <ProtectedPage allowedRoles={['DOCTOR']}>
      <main className="main-shell">
        <SiteHeader />
        <div className="topbar">
          <div>
            <h1 className="page-title">Prescripciones del médico</h1>
            <p>Lista de recetas con estado y detalles.</p>
          </div>
          <Link href="/doctor/prescriptions/new" className="button button-primary">
            Nuevo receta
          </Link>
        </div>

        {error && <div className="alert">{error}</div>}

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Paciente</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((prescription) => (
                <tr key={prescription.id}>
                  <td>{prescription.code}</td>
                  <td>{prescription.patient?.user.firstName ?? prescription.patientEmail ?? '—'}</td>
                  <td>
                    <span className={`status-pill ${prescription.status === 'CONSUMED' ? 'status-consumed' : 'status-pending'}`}>
                      {prescription.status.toLowerCase()}
                    </span>
                  </td>
                  <td>{new Date(prescription.createdAt).toLocaleDateString('es-ES')}</td>
                  <td>
                    <Link className="button button-secondary" href={`/doctor/prescriptions/${prescription.id}`}>
                      Ver detalles
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </ProtectedPage>
  );
}
