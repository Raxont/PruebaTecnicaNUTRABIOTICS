'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { apiFetch, apiFetchBlob } from '@/lib/api';
import { Prescription } from '@/lib/types';
import ProtectedPage from '@/components/ProtectedPage';
import SiteHeader from '@/components/SiteHeader';
import { useToast } from '@/components/ToastContext';

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

/* ── Skeleton rows ── */
function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="skeleton-row">
          <div className="skeleton skeleton-line" style={{ width: `${55 + (i % 3) * 15}%` }} />
          <div className="skeleton skeleton-line-sm" />
        </div>
      ))}
    </>
  );
}

/* ── Empty state ── */
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">📋</div>
      <div className="empty-state-title">
        {hasFilters ? 'Sin resultados' : 'Sin prescripciones'}
      </div>
      <p className="empty-state-desc">
        {hasFilters
          ? 'Ninguna receta coincide con los filtros aplicados. Prueba ajustando la búsqueda.'
          : 'Aún no has emitido ninguna receta. Crea la primera desde el botón superior.'}
      </p>
    </div>
  );
}

export default function DoctorPrescriptionsPage() {
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(INITIAL_FILTERS);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1, limit: 10, total: 0, totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const buildQuery = useCallback((f: Filters, page: number) => {
    const p = new URLSearchParams();
    p.set('page', String(page));
    p.set('limit', '10');
    if (f.status) p.set('status', f.status);
    if (f.dateFrom) p.set('dateFrom', f.dateFrom);
    if (f.dateTo) p.set('dateTo', f.dateTo);
    return p.toString();
  }, []);

  const loadPrescriptions = useCallback(async (f: Filters, page: number) => {
    setLoading(true);
    try {
      const qs = buildQuery(f, page);
      const result = await apiFetch<{ data: Prescription[]; pagination: PaginationInfo }>(
        `/prescriptions?${qs}`,
      );

      let data = result.data;
      if (f.patientSearch.trim()) {
        const q = f.patientSearch.trim().toLowerCase();
        data = data.filter((p) => {
          const name = `${p.patient?.user.firstName ?? ''} ${p.patient?.user.lastName ?? ''}`.toLowerCase();
          const email = (p.patient?.user.email ?? p.patientEmail ?? '').toLowerCase();
          return name.includes(q) || email.includes(q);
        });
      }

      setPrescriptions(data);
      setPagination(result.pagination);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error al cargar prescripciones', 'error');
    } finally {
      setLoading(false);
    }
  }, [buildQuery, toast]);

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

  const handleDownloadPdf = async (id: string, code: string) => {
    setDownloadingId(id);
    try {
      await apiFetchBlob(`/prescriptions/${id}/pdf`, `receta-${code}.pdf`);
      toast('PDF descargado correctamente', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error al descargar PDF', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  /* shared row renderer for table & mobile cards */
  const renderPrescription = (p: Prescription) => {
    const patientName = p.patient
      ? `${p.patient.user.firstName} ${p.patient.user.lastName}`
      : p.patientEmail ?? '—';
    const date = new Date(p.createdAt).toLocaleDateString('es-ES');
    const isConsumed = p.status === 'CONSUMED';

    return {
      code: p.code,
      patientName,
      date,
      isConsumed,
      pill: (
        <span className={`status-pill ${isConsumed ? 'status-consumed' : 'status-pending'}`}>
          {isConsumed ? 'Consumida' : 'Pendiente'}
        </span>
      ),
      actions: (
        <div className="row-actions">
          <Link className="button button-secondary button-sm" href={`/doctor/prescriptions/${p.id}`}>
            Ver
          </Link>
          <button
            className="button button-ghost button-sm"
            onClick={() => handleDownloadPdf(p.id, p.code)}
            disabled={downloadingId === p.id}
          >
            {downloadingId === p.id ? '…' : 'PDF'}
          </button>
        </div>
      ),
    };
  };

  return (
    <ProtectedPage allowedRoles={['DOCTOR']}>
      <main className="main-shell">
        <SiteHeader />

        <div className="topbar">
          <div className="topbar-meta">
            <h1 className="page-title">Prescripciones</h1>
            <p className="page-subtitle">Filtra y gestiona tus recetas emitidas.</p>
          </div>
          <Link href="/doctor/prescriptions/new" className="button button-primary">
            + Nueva receta
          </Link>
        </div>

        {/* ── Filters ── */}
        <div className="card filter-panel">
          <div className="filter-grid">
            <div className="filter-field">
              <span className="filter-label">Estado</span>
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

            <div className="filter-field">
              <span className="filter-label">Paciente</span>
              <input
                className="input"
                type="text"
                placeholder="Nombre o email"
                value={filters.patientSearch}
                onChange={(e) => setFilters((f) => ({ ...f, patientSearch: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              />
            </div>

            <div className="filter-field">
              <span className="filter-label">Desde</span>
              <input
                className="input"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
              />
            </div>

            <div className="filter-field">
              <span className="filter-label">Hasta</span>
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
              <>
                <button className="button button-secondary" onClick={handleClearFilters}>
                  Limpiar
                </button>
                <span className="filter-badge">Filtros activos</span>
              </>
            )}
          </div>
        </div>

        {/* ── Table / cards ── */}
        <div className="card">
          {loading ? (
            <SkeletonRows />
          ) : prescriptions.length === 0 ? (
            <EmptyState hasFilters={hasActiveFilters} />
          ) : (
            <>
              <p className="results-count">
                {pagination.total} resultado{pagination.total !== 1 ? 's' : ''}
                {hasActiveFilters ? ' · filtros activos' : ''}
              </p>

              {/* Desktop table */}
              <div className="table-wrapper">
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
                    {prescriptions.map((p) => {
                      const r = renderPrescription(p);
                      return (
                        <tr key={p.id}>
                          <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{r.code}</span></td>
                          <td>{r.patientName}</td>
                          <td>{r.pill}</td>
                          <td>{r.date}</td>
                          <td>{r.actions}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="mobile-card-list">
                {prescriptions.map((p) => {
                  const r = renderPrescription(p);
                  return (
                    <div key={p.id} className="rx-card">
                      <div className="rx-card-row">
                        <span className="rx-card-code">{r.code}</span>
                        {r.pill}
                      </div>
                      <div className="rx-card-row">
                        <span className="rx-card-label">Paciente</span>
                        <span className="rx-card-value">{r.patientName}</span>
                      </div>
                      <div className="rx-card-row">
                        <span className="rx-card-label">Fecha</span>
                        <span className="rx-card-value">{r.date}</span>
                      </div>
                      <div className="rx-card-actions">{r.actions}</div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="button button-secondary button-sm"
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >← Anterior</button>

                  <div className="pagination-pages">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 1)
                      .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                        if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((item, idx) =>
                        item === '...' ? (
                          <span key={`e-${idx}`} className="pagination-ellipsis">…</span>
                        ) : (
                          <button
                            key={item}
                            className={`button button-sm ${item === pagination.page ? 'button-primary' : 'button-secondary'}`}
                            onClick={() => goToPage(item as number)}
                            style={{ minWidth: 36 }}
                          >{item}</button>
                        ),
                      )}
                  </div>

                  <button
                    className="button button-secondary button-sm"
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >Siguiente →</button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </ProtectedPage>
  );
}