'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { apiFetch, apiFetchBlob } from '@/lib/api';
import { Prescription } from '@/lib/types';
import ProtectedPage from '@/components/ProtectedPage';
import SiteHeader from '@/components/SiteHeader';
import Toast from '@/components/Toast';

export default function DoctorPrescriptionDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    apiFetch<Prescription>(`/prescriptions/${params.id}`)
      .then(setPrescription)
      .catch((err) => setError(err.message));
  }, [params?.id]);

  useEffect(() => {
    const toastParam = searchParams?.get('toast');
    if (toastParam === 'created') {
      setToast({ message: 'Prescripción creada correctamente.', type: 'success' });
    }
  }, [searchParams]);

  const handleDownload = async (type: 'pdf' | 'qr') => {
    if (!prescription) return;
    setDownloading(type);
    try {
      const ext = type === 'pdf' ? 'pdf' : 'png';
      await apiFetchBlob(
        `/prescriptions/${prescription.id}/${type}`,
        `prescription-${prescription.id}.${ext}`,
      );
      setToast({
        message: type === 'pdf' ? 'PDF descargado correctamente.' : 'QR descargado correctamente.',
        type: 'success',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al descargar';
      setError(message);
      setToast({ message, type: 'error' });
    } finally {
      setDownloading(null);
    }
  };

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
              <p><strong>Código:</strong> {prescription.code}</p>
              <p>
                <strong>Paciente:</strong>{' '}
                {prescription.patient?.user.firstName ?? prescription.patientEmail ?? 'Paciente externo'}
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
                <p><strong>Notas:</strong> {prescription.notes}</p>
              )}
              <div className="page-actions">
                <button
                  className="button button-primary"
                  onClick={() => handleDownload('pdf')}
                  disabled={downloading !== null}
                >
                  {downloading === 'pdf' ? 'Descargando...' : 'Descargar PDF'}
                </button>
                <button
                  className="button button-secondary"
                  onClick={() => handleDownload('qr')}
                  disabled={downloading !== null}
                >
                  {downloading === 'qr' ? 'Descargando...' : 'Descargar QR'}
                </button>
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
        <Toast
          open={Boolean(toast)}
          message={toast?.message ?? ''}
          type={toast?.type ?? 'success'}
          onClose={() => setToast(null)}
        />
      </main>
    </ProtectedPage>
  );
}