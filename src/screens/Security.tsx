import { Card, InfoCard, PageHeader, SecurityIssueCard, SettingsRow, SuccessCard } from '../components/index.ts';
import { useAppState } from '../state/AppContext.tsx';
import { getRecommendedAccount, getRelatedAccounts } from '../state/security.ts';
import type { Route } from '../routes.ts';

export function Security({ navigate }: { navigate: (route: Route) => void }) {
  const { state, summary } = useAppState();
  const recommended = getRecommendedAccount(state.accounts);
  const relatedAccounts = recommended ? getRelatedAccounts(state.accounts, recommended.id) : [];
  const relatedNames = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' }).format(relatedAccounts.map(account => account.serviceName));
  const reusedAccount = state.accounts.find(account => account.status === 'reused');
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
        {recommended && <SecurityIssueCard title="Recommended first"
          description={recommended.issueType === 'reused'
            ? `${recommended.serviceName} shares a password with ${relatedNames}. One exposed password could affect several of your accounts.`
            : `${recommended.serviceName} has a password that is easy to guess. A strong, unique password helps protect this account.`}
          primary actionLabel={`Fix ${recommended.serviceName}’s password`}
          onAction={() => navigate({ screen: recommended.issueType === 'reused' ? 'reused-password' : 'weak-password', accountId: recommended.id })} />}
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
