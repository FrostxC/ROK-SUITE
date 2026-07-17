'use client';

// Player-facing MGE application page — the homepage "Apply for MGE" button
// lands here. Styled after /apply (Submit Lead Info): standalone page, short
// "before you start" orientation, then the application form for the currently
// open MGE event. The officer event manager stays at /mge.

import Link from 'next/link';
import { ArrowLeft, Crown, Info, Clock, CalendarDays, Shield } from 'lucide-react';
import { MgeApplyTab } from '@/components/mge/MgeApplyTab';
import { useMgeEvents, type MgeEvent } from '@/lib/supabase/use-mge';
import { isDeadlinePassed, formatDeadline } from '@/lib/mge/helpers';
import { parseMgeEventType } from '@/lib/mge/commanders';
import { useAuthRole, meetsRole } from '@/lib/auth-role';

function pickOpenEvent(events: MgeEvent[]): MgeEvent | null {
  // Prefer an explicitly open event whose deadline hasn't passed
  const open = events.filter(e => e.status === 'open');
  const live = open.find(e => !isDeadlinePassed(e.application_deadline));
  return live ?? open[0] ?? null;
}

export default function MgeApplyPage() {
  const { events, loading, refetch } = useMgeEvents();
  const { role } = useAuthRole();
  const isOfficer = meetsRole(role, ['admin', 'officer']);

  const event = pickOpenEvent(events);
  const focusCommander = event
    ? (event.mge_event_commanders.find(c => c.is_focus)?.commander_name
      || event.mge_event_commanders[0]?.commander_name
      || event.focused_commander.split(',')[0]?.trim() || '')
    : '';
  // Typed events ("Infantry MGE") don't have a fixed commander — the player
  // picks one in the form, so the checklist stays generic.
  const isTypedEvent = parseMgeEventType(focusCommander) !== null;
  const commanderLabel = isTypedEvent ? 'the commander you want' : focusCommander;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-[var(--background)]/90 backdrop-blur border-b border-[var(--border)]">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 -ml-2 px-2 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] rounded-md hover:bg-[var(--background-secondary)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to EMBERFALL</span>
          </Link>
          {isOfficer && (
            <Link
              href="/mge"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-[var(--gold)] border border-[var(--gold)]/25 hover:bg-[var(--gold)]/10 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" /> Officer view
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
        {/* Hero */}
        <section className="mb-6 sm:mb-8 text-center">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-[#DC143C] to-[#C9A961] shadow-lg shadow-[#DC143C]/25 mb-4">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--foreground)] tracking-tight mb-2">
            Apply for MGE
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-md mx-auto">
            Tell the kingdom which commander you&apos;re going for and prove you&apos;re ready —
            selections are ranked by your DKP contribution.
          </p>
        </section>

        {loading ? (
          <div className="rounded-2xl bg-[var(--background-card)] border border-[var(--border)] p-10 text-center">
            <p className="text-sm text-[var(--text-muted)]">Loading MGE events…</p>
          </div>
        ) : !event ? (
          /* No open event */
          <div className="space-y-4">
            <div className="rounded-2xl bg-[var(--background-card)] border border-[var(--border)] p-10 text-center">
              <Crown className="w-9 h-9 mx-auto mb-3 text-[var(--gold)]/50" />
              <p className="text-base font-semibold text-[var(--foreground)] mb-1">
                No MGE applications open right now
              </p>
              <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto">
                Officers open applications shortly before each Mightiest Governor event.
                Check back soon, or ask your alliance officer when the next one starts.
              </p>
              {isOfficer && (
                <Link
                  href="/mge"
                  className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#DC143C] to-[#8B0000] hover:opacity-90 transition-opacity"
                >
                  <Shield className="w-4 h-4" /> Open an event (officer)
                </Link>
              )}
            </div>

            {/* Non-open events exist — tell players where things stand, and officers what to do */}
            {(() => {
              const labels: Record<string, string> = {
                draft: 'Applications not open yet',
                reviewing: 'Applications closed — under review',
                finalized: 'Selections finalized',
              };
              const pending = events.filter(e => e.status in labels);
              if (pending.length === 0) return null;
              return (
                <div className="rounded-2xl bg-[var(--background-card)] border border-[var(--border)] p-5">
                  <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-3">Kingdom MGE events</p>
                  <div className="space-y-2">
                    {pending.map(d => (
                      <div key={d.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                        <Crown className="w-4 h-4 text-[var(--gold)]" />
                        <span className="text-[var(--foreground)] font-medium">{d.focused_commander}</span>
                        <span className="text-[var(--text-muted)]">{d.event_date}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--background-secondary)] text-[var(--text-muted)] border border-[var(--border)]">
                          {labels[d.status]}
                        </span>
                      </div>
                    ))}
                  </div>
                  {isOfficer && (
                    <p className="text-xs mt-3 text-[var(--gold)]/80">
                      Officer: players can only apply while an event&apos;s status is <strong>Open</strong> — set it from the event card in the officer view
                      (draft → &ldquo;Open Applications&rdquo;; clicking again moves it to reviewing, which closes applications).
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Before you start */}
            <section className="rounded-2xl bg-[#DC143C]/5 border border-[#DC143C]/20 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-[#DC143C]/10 text-[var(--gold)] flex-shrink-0">
                  <Info className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-sm font-semibold text-[var(--foreground)] mb-1.5 tracking-wide uppercase">
                    Before you start
                  </h2>
                  <ul className="space-y-1 text-xs text-[var(--text-secondary)] leading-relaxed">
                    <li>• Your governor name — search it from the kingdom roster</li>
                    <li>• A screenshot of <strong>{commanderLabel}</strong> — level, skills and stars visible</li>
                    <li>• A screenshot of the <strong>exact gear set you will run on him</strong> during the event — not your best set</li>
                    <li>• A screenshot of the <strong>armaments</strong> you will use</li>
                    <li>• A short reason: <strong>why should the kingdom invest him in you?</strong></li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Event summary */}
            <section className="rounded-2xl bg-[var(--background-card)] border border-[var(--border)] p-5 sm:p-6">
              <h2 className="font-display text-base font-semibold text-[var(--foreground)] tracking-wide uppercase mb-3">
                This event
              </h2>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <span className="flex items-center gap-2 text-[var(--foreground)]">
                  <Crown className="w-4 h-4 text-[var(--gold)]" /> {event.focused_commander}
                </span>
                <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <CalendarDays className="w-4 h-4 text-[var(--text-muted)]" /> {event.event_date}
                </span>
                {event.application_deadline && (
                  <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Clock className="w-4 h-4 text-[var(--text-muted)]" /> Apply by {formatDeadline(event.application_deadline)}
                  </span>
                )}
              </div>
            </section>

            {/* The application form (shared component — same one officers see) */}
            <section className="rounded-2xl bg-[var(--background-card)] border border-[var(--border)] overflow-hidden">
              <h2 className="font-display text-base font-semibold text-[var(--foreground)] tracking-wide uppercase px-5 pt-5 sm:px-6">
                Your application
              </h2>
              <MgeApplyTab event={event} onApplicationSubmitted={refetch} />
            </section>
          </div>
        )}

        <footer className="mt-10 pt-6 border-t border-[var(--border)] text-center">
          <p className="text-xs text-[var(--text-muted)]">
            EMBERFALL · Kingdom 3709 — selections are ranked by DKP score from the latest kingdom scan.
          </p>
        </footer>
      </main>
    </div>
  );
}
