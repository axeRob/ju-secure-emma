import { Card, InfoCard, PageHeader, SecurityIssueCard, SettingsRow, SuccessCard } from '../components/index.ts';
import { useAppState } from '../state/AppContext.tsx';
import type { Route } from '../routes.ts';

export function Security({ navigate }: { navigate: (route: Route) => void }) {
  const { state, summary } = useAppState();
  const reusedAccount = state.accounts.find(account => account.id === 'spotify' && account.status === 'reused')
    || state.accounts.find(account => account.status === 'reused');
  const relatedAccounts = reusedAccount ? state.accounts.filter(account => account.status === 'reused' && account.reusedGroupId === reusedAccount.reusedGroupId) : [];
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
        {reusedAccount && <SecurityIssueCard title={`Recommended first: ${reusedAccount.serviceName}`} description={`${reusedAccount.serviceName} shares a password with ${relatedAccounts.length - 1} other accounts. We’ll help you give it its own password first.`} actionLabel="Review shared password" onAction={() => navigate({ screen: 'reused-password', accountId: reusedAccount.id })} />}
        {!reusedAccount && weakAccount && <SecurityIssueCard title={`Recommended first: ${weakAccount.serviceName}`} description={`${weakAccount.serviceName} has a short, easy-to-guess demo password. We’ll help you make it stronger.`} actionLabel="See why it matters" onAction={() => navigate({ screen: 'weak-password', accountId: weakAccount.id })} />}
        {summary.needsAttention > 0 && <section aria-labelledby="more-security-heading" data-testid="security-issues-summary">
          <div className="section-heading"><h2 id="more-security-heading">More things to improve</h2></div>
          <Card className="settings-group">
            {reusedAccount && <SettingsRow title="Reused passwords" description={`${summary.reused} accounts`} onClick={() => navigate({ screen: 'reused-password', accountId: reusedAccount.id })} />}
            {weakAccount && <SettingsRow title="Weak passwords" description={`${summary.weak} accounts`} onClick={() => navigate({ screen: 'weak-password', accountId: weakAccount.id })} />}
          </Card>
        </section>}
        {summary.needsAttention === 0 && <SuccessCard title="You’re in a good place"><p>Every demo account has a unique, strong password.</p></SuccessCard>}
        <InfoCard title="One step at a time"><p>You don’t need to fix everything at once. We’ll explain what matters and help with one account at a time.</p></InfoCard>
      </div>
    </>
  );
}
