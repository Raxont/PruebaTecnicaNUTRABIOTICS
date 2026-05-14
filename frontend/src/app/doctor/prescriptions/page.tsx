'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { Prescription } from '@/lib/types';
import ProtectedPage from '@/components/ProtectedPage';
import SiteHeader from '@/components/SiteHeader';

interface Filters {
  status: string;
  patientSearch: string;
  dateFrom: string;
  dateTo: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const INITIAL_FILTERS: Filters = {
  status: '',
  patientSearch: '',
  dateFrom: '',
  dateTo: '',
};

export default function DoctorPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(INITIAL_FILTERS);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const buildQuery = useCallback(
    (f: Filters, page: number) => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '10');
      if (f.status) params.set('status', f.status);
      if (f.dateFrom) params.set('dateFrom', f.dateFrom);
      if (f.dateTo) params.set('dateTo', f.dateTo);
      return params.toString();
    },
    [],
  );

  const loadPrescriptions = useCallback(
    async (f: Filters, page: number) => {
      setLoading(true);
      setError(null);
      try {
        const qs = buildQuery(f, page);
        const result = await apiFetch<{ data: Prescription[]; pagination: PaginationInfo }>(
          `/prescriptions?${qs}`,
        );

        // Client-side filter by patient name / email (API doesn't expose this filter for doctors)
        let data = result.data;
        if (f.patientSearch.trim()) {
          const q = f.patientSearch.trim().toLowerCase();
          data = data.filter((p) => {
            const fullName =
              `${p.patient?.user.firstName ?? ''} ${p.patient?.user.lastName ?? ''}`.toLowerCase();
            const email = (p.patient?.user.email ?? p.patientEmail ?? '').toLowerCase();
            return fullName.includes(q) || email.includes(q);
          });
        }

        setPrescriptions(data);
        setPagination(result.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar prescripciones');
      } finally {
        setLoading(false);
      }
    },
    [buildQuery],
  );

  // Load on mount and whenever appliedFilters / page changes
  useEffect(() => {
    loadPrescriptions(appliedFilters, pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters, pagination.page]);

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setAppliedFilters(INITIAL_FILTERS);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters =
    appliedFilters.status !== '' ||
    appliedFilters.patientSearch !== '' ||
    appliedFilters.dateFrom !== '' ||
    appliedFilters.dateTo !== '';

  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    setPagination((prev) => ({ ...prev, page }));
  };

  return (
    <ProtectedPage allowedRoles={['DOCTOR']}>
      <main className="main-shell">
        <SiteHeader />

        <div className="topbar">
          <div>
            <h1 className="page-title">Prescripciones</h1>
            <p>Filtra y gestiona tus recetas emitidas.</p>
          </div>
          <Link href="/doctor/prescriptions/new" className="button button-primary">
            + Nueva receta
          </Link>
        </div>

        {/* ── Filter panel ── */}
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="filter-grid">
            {/* Status */}
            <div className="filter-field">
              <label className="filter-label">Estado</label>
              <select
                className="select"
                value={filters.status}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="">Todos</option>
                <option value="PENDING">Pendiente</option>
                <option value="CONSUMED">Consumida</option>
              </select>
            </div>

            {/* Patient search */}
            <div className="filter-field">
              <label className="filter-label">Paciente</label>
              <input
                className="input"
                type="text"
                placeholder="Nombre o email del paciente"
                value={filters.patientSearch}
                onChange={(e) => setFilters((f) => ({ ...f, patientSearch: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              />
            </div>

            {/* Date from */}
            <div className="filter-field">
              <label className="filter-label">Desde</label>
              <input
                className="input"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
              />
            </div>

            {/* Date to */}
            <div className="filter-field">
              <label className="filter-label">Hasta</label>
              <input
                className="input"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
              />
            </div>
          </div>

          <div className="filter-actions">
            <button className="button button-primary" onClick={handleApplyFilters} disabled={loading}>
              Buscar
            </button>
            {hasActiveFilters && (
              <button className="button button-secondary" onClick={handleClearFilters}>
                Limpiar filtros
              </button>
            )}
            {/* {hasActiveFilters && (
              <span className="filter-badge">
                Filtros activos
              </span>
            )} */}
          </div>
        </div>

        {error && <div className="alert">{error}</div>}

        {/* ── Results table ── */}
        <div className="card">
          {loading ? (
            <div className="empty-state">Cargando prescripciones...</div>
          ) : prescriptions.length === 0 ? (
            <div className="empty-state">
              {hasActiveFilters
                ? 'No se encontraron prescripciones con los filtros aplicados.'
                : 'No hay prescripciones disponibles.'}
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 12, color: '#6b7280', fontSize: '0.9rem' }}>
                {pagination.total} resultado{pagination.total !== 1 ? 's' : ''}
                {/* {hasActiveFilters ? ' con filtros aplicados' : ''} */}
              </div>
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
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          {prescription.code}
                        </span>
                      </td>
                      <td>
                        {prescription.patient
                          ? `${prescription.patient.user.firstName} ${prescription.patient.user.lastName}`
                          : prescription.patientEmail ?? '—'}
                      </td>
                      <td>
                        <span
                          className={`status-pill ${
                            prescription.status === 'CONSUMED'
                              ? 'status-consumed'
                              : 'status-pending'
                          }`}
                        >
                          {prescription.status === 'CONSUMED' ? 'Consumida' : 'Pendiente'}
                        </span>
                      </td>
                      <td>{new Date(prescription.createdAt).toLocaleDateString('es-ES')}</td>
                      <td>
                        <Link
                          className="button button-secondary"
                          href={`/doctor/prescriptions/${prescription.id}`}
                          style={{ padding: '8px 14px', fontSize: '0.875rem' }}
                        >
                          Ver detalles
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* ── Pagination ── */}
              {pagination.totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="button button-secondary"
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    style={{ padding: '8px 14px' }}
                  >
                    ← Anterior
                  </button>

                  <div className="pagination-pages">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter(
                        (p) =>
                          p === 1 ||
                          p === pagination.totalPages ||
                          Math.abs(p - pagination.page) <= 1,
                      )
                      .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                        if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((item, idx) =>
                        item === '...' ? (
                          <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                            …
                          </span>
                        ) : (
                          <button
                            key={item}
                            className={`button ${
                              item === pagination.page ? 'button-primary' : 'button-secondary'
                            }`}
                            onClick={() => goToPage(item as number)}
                            style={{ padding: '8px 14px', minWidth: 40 }}
                          >
                            {item}
                          </button>
                        ),
                      )}
                  </div>

                  <button
                    className="button button-secondary"
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    style={{ padding: '8px 14px' }}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <style jsx>{`
        .filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }
        .filter-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .filter-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .filter-field .input,
        .filter-field .select {
          margin: 0;
        }
        .filter-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }
        .filter-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #eef2ff;
          color: #4338ca;
          border-radius: 999px;
          padding: 5px 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        .filter-badge::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4338ca;
          display: inline-block;
        }
        .empty-state {
          text-align: center;
          padding: 48px 24px;
          color: #9ca3af;
          font-size: 0.95rem;
        }
        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 24px;
          flex-wrap: wrap;
        }
        .pagination-pages {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .pagination-ellipsis {
          padding: 0 4px;
          color: #9ca3af;
        }
      `}</style>
    </ProtectedPage>
  );
}