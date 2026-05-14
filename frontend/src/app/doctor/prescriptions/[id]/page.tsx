'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Prescription } from '@/lib/types';
import ProtectedPage from '@/components/ProtectedPage';
import SiteHeader from '@/components/SiteHeader';

export default function DoctorPrescriptionDetailPage() {
  const params = useParams();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    apiFetch<Prescription>(`/prescriptions/${params.id}`)
      .then(setPrescription)
      .catch((err) => setError(err.message));
  }, [params?.id]);

  return (
    <ProtectedPage allowedRoles={['DOCTOR']}>
      <main className="main-shell">
        <SiteHeader />
        <div className="topbar">
          <div>
            <h1 className="page-title">Detalle de prescripción</h1>
            <p>Revisa la receta, descarga el PDF o comparte el código QR.</p>
          </div>
          <Link href="/doctor/prescriptions" className="button button-secondary">
            Volver a lista
          </Link>
        </div>

        {error && <div className="alert">{error}</div>}

        {prescription ? (
          <>
            <div className="card" style={{ marginBottom: 16 }}>
              <p>
                <strong>Código:</strong> {prescription.code}
              </p>
              <p>
                <strong>Paciente:</strong> {prescription.patient?.user.firstName ?? prescription.patientEmail ?? 'Paciente externo'}
              </p>
              <p>
                <strong>Estado:</strong>{' '}
                <span className={prescription.status === 'CONSUMED' ? 'status-pill status-consumed' : 'status-pill status-pending'}>
                  {prescription.status.toLowerCase()}
                </span>
              </p>
              <p>
                <strong>Fecha:</strong> {new Date(prescription.createdAt).toLocaleDateString('es-ES')}
              </p>
              {prescription.notes && (
                <p>
                  <strong>Notas:</strong> {prescription.notes}
                </p>
              )}
              <div className="page-actions">
                <a
                  className="button button-primary"
                  href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/prescriptions/${prescription.id}/pdf`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Descargar PDF
                </a>
                <a
                  className="button button-secondary"
                  href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/prescriptions/${prescription.id}/qr`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Descargar QR
                </a>
              </div>
            </div>

            <div className="card">
              <h2 className="section-title">Medicamentos</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Dosis</th>
                    <th>Cantidad</th>
                    <th>Instrucciones</th>
                  </tr>
                </thead>
                <tbody>
                  {prescription.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.dosage}</td>
                      <td>{item.quantity}</td>
                      <td>{item.instructions ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="card">Cargando prescripción...</div>
        )}
      </main>
    </ProtectedPage>
  );
}
