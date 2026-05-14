'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import ProtectedPage from '@/components/ProtectedPage';
import SiteHeader from '@/components/SiteHeader';
import Toast from '@/components/Toast';

interface Item {
  name: string;
  dosage: string;
  quantity: string;
  instructions: string;
}

export default function DoctorPrescriptionNewPage() {
  const router = useRouter();
  const [patientEmail, setPatientEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<Item[]>([
    { name: '', dosage: '', quantity: '1', instructions: '' },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const updateItem = (index: number, field: keyof Item, value: string) => {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const addItem = () => setItems((current) => [...current, { name: '', dosage: '', quantity: '1', instructions: '' }]);
  const removeItem = (index: number) => setItems((current) => current.filter((_, i) => i !== index));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const body = {
        patientEmail,
        notes,
        items: items.map((item) => ({ ...item })),
      };

      const result = await apiFetch('/prescriptions', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      router.push(`/doctor/prescriptions/${result.id}?toast=created`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear la receta';
      setError(message);
      setToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedPage allowedRoles={['DOCTOR']}>
      <main className="main-shell">
        <SiteHeader />
        <div className="topbar">
          <div>
            <h1 className="page-title">Nueva prescripción</h1>
            <p>Completa los datos del paciente y los medicamentos.</p>
          </div>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <label>
              Email del paciente
              <input
                className="input"
                type="email"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                required
              />
            </label>
            <label>
              Notas
              <textarea
                className="textarea"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>

            <h2 className="section-title">Medicamentos</h2>
            {items.map((item, index) => (
              <div key={index} className="card" style={{ marginBottom: 18 }}>
                <label>
                  Nombre
                  <input
                    className="input"
                    value={item.name}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    required
                  />
                </label>
                <label>
                  Dosis
                  <input
                    className="input"
                    value={item.dosage}
                    onChange={(e) => updateItem(index, 'dosage', e.target.value)}
                    required
                  />
                </label>
                <label>
                  Cantidad
                  <input
                    className="input"
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    required
                  />
                </label>
                <label>
                  Instrucciones
                  <textarea
                    className="textarea"
                    rows={3}
                    value={item.instructions}
                    onChange={(e) => updateItem(index, 'instructions', e.target.value)}
                  />
                </label>
                <button type="button" className="button button-danger" onClick={() => removeItem(index)}>
                  Eliminar ítem
                </button>
              </div>
            ))}

            <div className="page-actions">
              <button type="button" className="button button-secondary" onClick={addItem}>
                Agregar medicamento
              </button>
              <button className="button button-primary" type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Crear prescripción'}
              </button>
            </div>
            {error && <div className="alert">{error}</div>}
          </form>
        </div>
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
