import { InfoCard, PageHeader, SecurityIssueCard, SuccessCard } from '../components/index.ts';
import { useAppState } from '../state/AppContext.tsx';
import type { Route } from '../routes.ts';

export function Security({ navigate }: { navigate: (route: Route) => void }) {
  const { state, summary } = useAppState();
  const reusedAccount = state.accounts.find(account => account.id === 'spotify' && account.status === 'reused')
    || state.accounts.find(account => account.status === 'reused');
  const relatedAccounts = reusedAccount ? state.accounts.filter(account => account.reusedGroupId === reusedAccount.reusedGroupId) : [];
  const weakAccount = state.accounts.find(account => account.issueType === 'weak');
  return (
    <>
      <PageHeader title="Security" subtitle="A clear next step, when you need one." />
      <div className="security-intro">
        <span className="section-eyebrow">YOUR VAULT AT A GLANCE</span>
        <h2>{summary.needsAttention ? 'A little safer, one step at a time.' : 'Your accounts look good.'}</h2>
        <p>{summary.safe} accounts are safe. {summary.needsAttention ? `${summary.needsAttention} could use a little attention.` : 'Each account has its own strong demo password.'}</p>
      </div>
      <div className="screen-stack">
        {reusedAccount && <SecurityIssueCard title={`Start with ${reusedAccount.serviceName}`} description={`A password is shared across ${relatedAccounts.length} accounts. Giving ${reusedAccount.serviceName} its own password helps keep the others separate.`} actionLabel="Review shared password" onAction={() => navigate({ screen: 'reused-password', accountId: reusedAccount.id })} />}
        {weakAccount && <SecurityIssueCard title="One password could be stronger" description={`${weakAccount.serviceName} has a short, easy-to-guess demo password. We’ll help you make it stronger.`} actionLabel="See why it matters" onAction={() => navigate({ screen: 'weak-password', accountId: weakAccount.id })} />}
        {summary.needsAttention === 0 && <SuccessCard title="You’re in a good place"><p>Every demo account has a unique, strong password.</p></SuccessCard>}
        <InfoCard title="One step at a time"><p>You don’t need to fix everything at once. We’ll explain what matters and help with one account at a time.</p></InfoCard>
      </div>
    </>
  );
}
