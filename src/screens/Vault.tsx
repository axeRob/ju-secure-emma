import { useEffect, useRef } from 'react';
import { AccountCard, FloatingActionButton, PageHeader, SecuritySummary } from '../components/index.ts';
import { useAppState } from '../state/AppContext.tsx';
import type { Route } from '../routes.ts';

export function Vault({ navigate, focusNewestAccount = false }: { navigate: (route: Route) => void; focusNewestAccount?: boolean }) {
  const { state, summary } = useAppState();
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!focusNewestAccount) return;
    const frame = window.requestAnimationFrame(() => {
      const lastAccount = listRef.current?.lastElementChild as HTMLButtonElement | null;
      lastAccount?.scrollIntoView({ block: 'center', behavior: 'instant' });
      lastAccount?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [focusNewestAccount]);
  const recommended = state.accounts.find(account => account.id === 'spotify' && account.status !== 'safe')
    || state.accounts.find(account => account.status === 'reused')
    || state.accounts.find(account => account.status === 'weak');
  return (
    <>
      <PageHeader title="Vault" subtitle="Problems are explained, not hidden." />
      <SecuritySummary summary={summary}
        recommendationLabel={recommended ? `Fix ${recommended.serviceName}’s ${recommended.issueType === 'reused' ? 'shared' : 'weak'} password` : undefined}
        onRecommendation={() => { if (recommended) navigate({ screen: recommended.issueType === 'reused' ? 'reused-password' : 'weak-password', accountId: recommended.id }); }} />
      <section className="accounts-section" aria-labelledby="accounts-heading">
        <div className="section-heading"><h2 id="accounts-heading">Your accounts</h2><span className="count-label">{summary.total} accounts</span></div>
        <div className="account-list" ref={listRef}>{state.accounts.map(account => (
          <AccountCard key={account.id} account={account} onClick={() => navigate({ screen: 'account', accountId: account.id })} />
        ))}</div>
      </section>
      <p className="demo-footnote">Made for learning. All accounts are demo data.</p>
      <FloatingActionButton onClick={() => navigate({ screen: 'add-account' })} />
    </>
  );
}
