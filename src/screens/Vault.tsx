import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { AccountCard, Card, FloatingActionButton, PageHeader, PrimaryButton, SecuritySummary } from '../components/index.ts';
import { useAppState } from '../state/AppContext.tsx';
import { getRecommendedAccount, getRelatedAccounts } from '../state/security.ts';
import type { Route } from '../routes.ts';

export function Vault({ navigate, focusNewestAccount = false, deferredAccountId }: {
  navigate: (route: Route) => void;
  focusNewestAccount?: boolean;
  deferredAccountId?: string | null;
}) {
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
  const deferred = state.accounts.find(account => account.id === deferredAccountId && account.status !== 'safe');
  const recommended = deferred || getRecommendedAccount(state.accounts);
  const related = recommended ? getRelatedAccounts(state.accounts, recommended.id) : [];
  return (
    <>
      <PageHeader title="Vault" subtitle="Problems are explained, not hidden." />
      <SecuritySummary summary={summary} />
      {recommended && <Card className="recommendation-card" data-testid="vault-recommendation">
        <span className="recommendation-eyebrow">{deferred ? 'Still needs attention' : 'Recommended now'}</span>
        <h2 className="recommendation-title">{recommended.issueType === 'reused'
          ? `${recommended.serviceName} shares a password with ${related.length} other ${related.length === 1 ? 'account' : 'accounts'}.`
          : `${recommended.serviceName} has a password that is easy to guess.`}</h2>
        {recommended.issueType === 'reused' && <ul className="related-account-list" aria-label="Accounts sharing this password">
          {[recommended, ...related].map(account => <li key={account.id}>{account.serviceName}</li>)}
        </ul>}
        <p className="recommendation-description">{recommended.issueType === 'reused'
          ? 'If one account is exposed, the same password could be tried on the others.'
          : 'A strong, unique password helps protect this account.'}</p>
        <p className="recommendation-effort">In this demo, fixing {recommended.serviceName} takes about 10 seconds.</p>
        {deferred && <p className="recommendation-reminder">You can fix this whenever you’re ready.</p>}
        <PrimaryButton onClick={() => navigate({ screen: recommended.issueType === 'reused' ? 'reused-password' : 'weak-password', accountId: recommended.id })}>
          Fix {recommended.serviceName} now <ArrowRight size={17} aria-hidden="true" />
        </PrimaryButton>
      </Card>}
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
