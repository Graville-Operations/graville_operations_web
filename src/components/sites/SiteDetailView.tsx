'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin, Calendar, Building2, Loader2, FileText, Briefcase,
  Users, ClipboardList, UserCheck, ChevronLeft, DollarSign,
  TrendingUp, Download, PiggyBank, Receipt, Pencil,
} from 'lucide-react';
import { PROJECT_STATUS_META, normProjectStatus, isProjectStatusLocked, fmtKes, downloadAttendanceCSV } from '@/lib/utils/site-helpers';
import { useSiteDetail } from '@/hooks/sites/useSiteDetail';
import { ROUTES } from '@/lib/routes';
import { ProjectCompletionGauge } from '@/components/sites/ProjectCompletionGauge';
import { ExpenditureGauge } from '@/components/sites/ExpenditureGauge';
import { WeeklyAttendanceChart } from '@/components/sites/WeeklyAttendanceChart';
import { AnalyticsTaskRow } from '@/components/sites/AnalyticsTaskRow';
import { AttendanceRow } from '@/components/sites/AttendanceRow';
import { AllWorkersScreen } from '@/components/sites/AllWorkersScreen';
import { DateRangePicker } from '@/components/sites/DateRangePicker';
import { FieldOperatorCard } from '@/components/sites/FieldOperatorCard';
import { UpdateSiteOverlay } from '@/components/sites/UpdateSiteOverlay';

export function SiteDetailView({ siteId }: { siteId: number }) {
  const router = useRouter();

  useEffect(() => {
    const sidebar = document.querySelector('aside') as HTMLElement | null;
    if (sidebar) sidebar.style.display = 'none';
    return () => { if (sidebar) sidebar.style.display = ''; };
  }, []);

  const {
    detail, loadingDetail, refreshDetail,
    updatingSite, updateSiteDetail,
    analytics, loadingAnalytics,
    rangeRecords, rangePayouts, loadingRange,
    rangeFrom, rangeTo, setRangeFrom, setRangeTo, todayStr, rangeLabel,
    derived,
  } = useSiteDetail(siteId);

  const [showAllWorkers, setShowAllWorkers] = useState(false);
  const [showUpdateSite, setShowUpdateSite] = useState(false);

  const {
    estimatedValue, totalExpenditure, availableBudget,
    projectCompletion, timePct, todayAttendance, previousAttendance,
    attendanceBreakdown, taskBreakdown, completedTasks, totalWorkers,
  } = derived;

  const PREVIEW_LIMIT  = 5;
  const previewRecords = rangeRecords.slice(0, PREVIEW_LIMIT);
  const hasMore        = rangeRecords.length > PREVIEW_LIMIT;

  const handleBack = () => router.push(ROUTES.projects.sites);

  const siteName = detail?.name ?? '';
  const projectStatus = detail ? normProjectStatus(detail.projectStatus) : null;
  const statusMeta = projectStatus ? PROJECT_STATUS_META[projectStatus] : null;
  const updateLocked = projectStatus ? isProjectStatusLocked(projectStatus) : false;

  const handleUpdateSite = async (payload: Parameters<typeof updateSiteDetail>[0]) => {
    await updateSiteDetail(payload);
    setShowUpdateSite(false);
  };

  return (
    <>
      {showAllWorkers && (
        <AllWorkersScreen
          records={rangeRecords}
          dateLabel={rangeLabel}
          onClose={() => setShowAllWorkers(false)}
        />
      )}

      <UpdateSiteOverlay
        open={showUpdateSite}
        onOpenChange={setShowUpdateSite}
        site={detail}
        submitting={updatingSite}
        onSubmit={handleUpdateSite}
      />

      <div className="w-full" style={{ background: 'var(--gv-bg-gradient)', minHeight: '100vh' }}>

        <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-6 py-4"
          style={{
            background: 'var(--gv-nav-bg)',
            borderBottom: '1px solid var(--gv-glass-border)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.5)',
          }}>
          <button onClick={handleBack} className="flex items-center gap-2 text-base font-semibold"
            style={{ color: 'var(--gv-brand)' }}>
            <ChevronLeft className="w-5 h-5" />Back to Sites
          </button>
          <span className="text-lg font-bold text-white flex-1 text-center">Site Details</span>
          <span className="w-28" />
        </div>

        <div className="mx-auto pt-20 pb-20" style={{ width: '80%' }}>
          <div className="flex flex-col gap-8">

            <div className="gv-card flex flex-col gap-5"
              style={{ background: 'linear-gradient(135deg,rgba(30,42,58,0.95) 0%,rgba(20,32,46,0.95) 100%)' }}>
              <div className="flex items-start justify-between gap-4">
                {loadingDetail
                  ? <div className="h-9 w-64 rounded-lg animate-pulse" style={{ background: 'var(--gv-glass-bg-strong)' }} />
                  : <h1 className="text-4xl font-bold text-white leading-tight">{siteName}</h1>}
                {loadingDetail || !statusMeta
                  ? <div className="h-8 w-24 rounded-full animate-pulse flex-shrink-0" style={{ background: 'var(--gv-glass-bg-strong)' }} />
                  : (
                    <span className={`text-base font-semibold px-4 py-1.5 rounded-full flex-shrink-0 ${statusMeta.bg} ${statusMeta.color}`}>
                      {statusMeta.label}
                    </span>
                  )}
              </div>
              {loadingDetail ? (
                <div className="grid grid-cols-2 gap-3">
                  {[70, 55, 65, 50].map((w, i) => (
                    <div key={i} className="h-5 rounded animate-pulse"
                      style={{ background: 'var(--gv-glass-bg-strong)', width: `${w}%` }} />
                  ))}
                </div>
              ) : detail && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {detail.location && (
                    <div className="flex items-center gap-2 text-base" style={{ color: 'var(--gv-text-muted)' }}>
                      <MapPin className="w-4 h-4 flex-shrink-0" /><span>{detail.location}</span>
                    </div>
                  )}
                  {detail.description && (
                    <div className="flex items-center gap-2 text-base" style={{ color: 'var(--gv-text-muted)' }}>
                      <FileText className="w-4 h-4 flex-shrink-0" /><span>{detail.description}</span>
                    </div>
                  )}
                  {(detail.createdAt || detail.completionDate) && (
                    <div className="flex items-center gap-2 text-base" style={{ color: 'var(--gv-text-muted)' }}>
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {detail.createdAt ? `Started ${detail.createdAt}` : ''}
                        {detail.completionDate ? ` · Deadline ${detail.completionDate}` : ''}
                      </span>
                    </div>
                  )}
                  {detail.tendererName && (
                    <div className="flex items-center gap-2 text-base" style={{ color: 'var(--gv-text-muted)' }}>
                      <Briefcase className="w-4 h-4 flex-shrink-0" /><span>Tenderer: {detail.tendererName}</span>
                    </div>
                  )}
                  {detail.inquiringEntity && (
                    <div className="flex items-center gap-2 text-base" style={{ color: 'var(--gv-text-muted)' }}>
                      <Building2 className="w-4 h-4 flex-shrink-0" /><span>Procuring entity: {detail.inquiringEntity}</span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <div className="relative flex items-center mb-1" style={{ minHeight: '2.25rem' }}>
                  <p className="gv-label">Field Operator</p>
                  <button
                    type="button"
                    onClick={() => !updateLocked && setShowUpdateSite(true)}
                    disabled={updateLocked}
                    title={updateLocked ? "Site is completed or cancelled and can no longer be updated" : undefined}
                    className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
                    style={{
                      background: 'var(--gv-glass-bg)',
                      border: '1px solid var(--gv-glass-border)',
                      color: updateLocked ? 'var(--gv-text-faint)' : 'var(--gv-brand)',
                      opacity: updateLocked ? 0.5 : 1,
                      cursor: updateLocked ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Update Site
                  </button>
                </div>
                <FieldOperatorCard
                  siteId={siteId}
                  operator={detail?.operator ?? null}
                  loading={loadingDetail}
                  onOperatorChange={refreshDetail}
                />
              </div>

              <div style={{ borderTop: '1px solid var(--gv-glass-border)', paddingTop: '1.25rem' }}>
                <p className="gv-label">Estimated Value</p>
                {loadingDetail && !analytics
                  ? <div className="h-8 w-40 rounded animate-pulse mt-1" style={{ background: 'var(--gv-glass-bg-strong)' }} />
                  : <p className="text-4xl font-bold text-white">{fmtKes(estimatedValue)}</p>}
              </div>
            </div>

            <section>
              <p className="text-2xl font-semibold text-white mb-4">Project Overview</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="gv-card flex flex-col gap-1">
                  <p className="gv-label">Total Workers</p>
                  {loadingAnalytics
                    ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                    : <p className="text-5xl font-bold text-white">{totalWorkers}</p>}
                  <p className="text-sm mt-1" style={{ color: 'var(--gv-text-subtle)' }}>Overall headcount</p>
                </div>
                <div className="gv-card flex flex-col gap-1">
                  <p className="gv-label">Completion Rate</p>
                  {loadingAnalytics
                    ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                    : <p className="text-5xl font-bold text-white">{projectCompletion}%</p>}
                  <p className="text-sm mt-1" style={{ color: 'var(--gv-text-subtle)' }}>Based on subtasks from DB</p>
                </div>
                <div className="gv-card flex flex-col gap-1">
                  <p className="gv-label">Tasks Completed</p>
                  {loadingAnalytics
                    ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                    : <p className="text-5xl font-bold text-white">{completedTasks}</p>}
                  <p className="text-sm mt-1" style={{ color: 'var(--gv-text-subtle)' }}>{completedTasks} of {taskBreakdown.length} tasks</p>
                </div>
                <div className="gv-card flex flex-col gap-1">
                  <p className="gv-label">Estimated Value</p>
                  {loadingAnalytics && !detail
                    ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                    : <p className="text-2xl font-bold text-white leading-tight">{fmtKes(estimatedValue)}</p>}
                  <p className="text-sm mt-1" style={{ color: 'var(--gv-text-subtle)' }}>Total budget</p>
                </div>
              </div>
            </section>

            <section>
              <p className="text-2xl font-semibold text-white mb-4">Financials</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: DollarSign, label: 'Estimated Value',    value: fmtKes(estimatedValue),  sub: 'Total project budget',              loading: loadingAnalytics && !detail },
                  { icon: Receipt,    label: 'Project Expenditure', value: fmtKes(totalExpenditure),sub: 'Spent to date',                     loading: loadingAnalytics },
                  { icon: PiggyBank,  label: 'Available Budget',    value: fmtKes(availableBudget), sub: 'Estimated value minus expenditure', loading: loadingAnalytics },
                ].map((card) => (
                  <div key={card.label} className="gv-card flex items-center gap-4">
                    <div className="gv-icon-box flex-shrink-0">
                      <card.icon className="w-5 h-5" style={{ color: 'var(--gv-brand)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="gv-label">{card.label}</p>
                      {card.loading
                        ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                        : <p className="text-2xl font-bold text-white">{card.value}</p>}
                      <p className="text-sm mt-1" style={{ color: 'var(--gv-text-subtle)' }}>{card.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <p className="text-2xl font-semibold text-white mb-4">Visual Metrics</p>
              <div className="gv-card">
                {loadingAnalytics ? (
                  <div className="flex items-center justify-center py-16 gap-3">
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                    <span className="text-base" style={{ color: 'var(--gv-text-muted)' }}>Loading metrics…</span>
                  </div>
                ) : (
                  <div className="flex items-start">
                    <div className="flex-1 flex flex-col items-center px-6 py-2">
                      <ProjectCompletionGauge taskPct={projectCompletion} timePct={timePct} />
                    </div>
                    <div className="self-stretch w-px my-4" style={{ background: 'var(--gv-glass-border)' }} />
                    <div className="flex-1 flex flex-col items-center px-6 py-2">
                      <ExpenditureGauge
                        totalExpenditure={totalExpenditure}
                        estimatedValue={estimatedValue}
                        timePct={timePct}
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section>
              <p className="text-2xl font-semibold text-white mb-4">Attendance</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-4">
                  <div className="gv-card flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-sm mb-1" style={{ color: 'var(--gv-brand)' }}>
                      <Calendar className="w-3.5 h-3.5" />Today
                    </div>
                    {loadingAnalytics
                      ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                      : <p className="text-5xl font-bold text-white">{todayAttendance}</p>}
                    <p className="text-sm mt-1" style={{ color: 'var(--gv-text-subtle)' }}>Check-ins today</p>
                  </div>
                  <div className="gv-card flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-sm mb-1" style={{ color: 'var(--gv-text-muted)' }}>
                      <Calendar className="w-3.5 h-3.5" />Previous
                    </div>
                    {loadingAnalytics
                      ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                      : <p className="text-5xl font-bold text-white">{previousAttendance}</p>}
                    <p className="text-sm mt-1" style={{ color: 'var(--gv-text-subtle)' }}>Yesterday's check-ins</p>
                  </div>
                </div>
                <div className="gv-card md:col-span-2 flex flex-col">
                  <p className="text-base font-semibold text-white mb-4">Daily Attendance</p>
                  {loadingAnalytics ? (
                    <div className="flex items-center justify-center py-10 flex-1">
                      <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                    </div>
                  ) : attendanceBreakdown.length > 0 ? (
                    <div className="mt-auto">
                      <WeeklyAttendanceChart breakdown={attendanceBreakdown} totalWorkers={totalWorkers} />
                    </div>
                  ) : (
                    <p className="text-sm text-center py-6 flex-1 flex items-center justify-center" style={{ color: 'var(--gv-text-subtle)' }}>
                      No attendance data available
                    </p>
                  )}
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              <section>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-2xl font-semibold text-white">Task Breakdown</p>
                </div>
                {loadingAnalytics ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-7 h-7 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                  </div>
                ) : taskBreakdown.length === 0 ? (
                  <div className="gv-card flex flex-col items-center gap-3 py-16 text-center">
                    <ClipboardList className="w-8 h-8" style={{ color: 'var(--gv-text-subtle)' }} />
                    <p className="text-base text-white">No tasks yet</p>
                    <p className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>Tasks assigned to this site will appear here</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {taskBreakdown.map((task, idx) => (
                      <AnalyticsTaskRow key={idx} task={task} />
                    ))}
                  </div>
                )}
              </section>

              <section>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-2xl font-semibold text-white">Workers on Site</p>
                  <button
                    type="button"
                    onClick={() => downloadAttendanceCSV(rangeRecords, rangeLabel, siteName)}
                    disabled={rangeRecords.length === 0}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-opacity"
                    style={{
                      background: 'var(--gv-glass-bg)',
                      border: '1px solid var(--gv-glass-border)',
                      opacity: rangeRecords.length === 0 ? 0.4 : 1,
                      cursor: rangeRecords.length === 0 ? 'not-allowed' : 'pointer',
                    }}
                    title="Download attendance CSV"
                  >
                    <Download className="w-3.5 h-3.5" style={{ color: 'var(--gv-text-muted)' }} />
                  </button>
                </div>

                <DateRangePicker
                  from={rangeFrom}
                  to={rangeTo}
                  maxDate={todayStr}
                  onChange={(f, t) => { setRangeFrom(f); setRangeTo(t); }}
                />

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="gv-card flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-sm mb-1" style={{ color: 'var(--gv-brand)' }}>
                      <Users className="w-3.5 h-3.5" />Present
                    </div>
                    {loadingRange
                      ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                      : <p className="text-5xl font-bold text-white">{rangeRecords.length}</p>}
                    <p className="text-sm mt-1" style={{ color: 'var(--gv-text-subtle)' }}>{rangeLabel}</p>
                  </div>
                  <div className="gv-card flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-sm mb-1" style={{ color: '#f87171' }}>
                      <TrendingUp className="w-3.5 h-3.5" />Payouts
                    </div>
                    {loadingRange
                      ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                      : <p className="text-3xl font-bold text-white">{fmtKes(rangePayouts)}</p>}
                    <p className="text-sm mt-1" style={{ color: 'var(--gv-text-subtle)' }}></p>
                  </div>
                </div>

                {loadingRange ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-7 h-7 animate-spin" style={{ color: 'var(--gv-brand)' }} />
                  </div>
                ) : rangeRecords.length === 0 ? (
                  <div className="gv-card flex flex-col items-center gap-3 py-16 text-center">
                    <UserCheck className="w-8 h-8" style={{ color: 'var(--gv-text-subtle)' }} />
                    <p className="text-base text-white">No check-ins for {rangeLabel}</p>
                    <p className="text-sm" style={{ color: 'var(--gv-text-subtle)' }}>Try a different date range</p>
                  </div>
                ) : (
                  <>
                    <div className="gv-card" style={{ padding: '0 1rem' }}>
                      {previewRecords.map((r) => <AttendanceRow key={r.id} record={r} />)}
                    </div>
                    {hasMore && (
                      <button
                        onClick={() => setShowAllWorkers(true)}
                        className="mt-3 w-full py-3 rounded-2xl text-base font-semibold flex items-center justify-center gap-2 transition-all"
                        style={{
                          background: 'var(--gv-glass-bg)',
                          border: '1px solid var(--gv-glass-border)',
                          color: 'var(--gv-brand)',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(51,144,124,0.12)';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(51,144,124,0.4)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'var(--gv-glass-bg)';
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--gv-glass-border)';
                        }}
                      >
                        <Users className="w-4 h-4" />
                        View all {rangeRecords.length} workers
                      </button>
                    )}
                  </>
                )}
              </section>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}