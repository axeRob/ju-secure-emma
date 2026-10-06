import { ArrowRight } from 'lucide-react';
import { Card, InfoCard, PageHeader, PasswordDisplay, PrimaryButton, StatusPill } from '../components/index.ts';
import { useAppState } from '../state/AppContext.tsx';
import { getRelatedAccounts } from '../state/security.ts';
import type { Route } from '../routes.ts';

export function AccountNotFound({ navigate }: { navigate: (route: Route) => void }) {
  return <><PageHeader title="Account not found" onBack={() => navigate({ screen: 'vault' })} /><div className="screen-stack"><InfoCard><p>This demo account isn’t in the vault.</p></InfoCard><PrimaryButton onClick={() => navigate({ screen: 'vault' })}>Back to vault</PrimaryButton></div></>;
}

export function AccountDetails({ accountId, navigate }: { accountId: string; navigate: (route: Route) => void }) {
  const { state } = useAppState();
  const account = state.accounts.find(item => item.id === accountId);
  if (!account) return <AccountNotFound navigate={navigate} />;
  const related = getRelatedAccounts(state.accounts, account.id);
  return (
    <>
      <PageHeader title="Account details" subtitle="The essentials, all in one place." onBack={() => navigate({ screen: 'vault' })} />
      <Card className="account-details">
        <span className="service-mark detail-mark" aria-hidden="true">{account.initial}</span>
        <h2>{account.serviceName}</h2><p>{account.username}</p><StatusPill status={account.status} />
        <PasswordDisplay value={account.demoPassword} />
      </Card>
      <InfoCard title={account.status === 'safe' ? 'This account looks good' : 'Needs attention'}>
        {account.status === 'safe' ? <p>This demo account has its own strong password.</p> : account.issueType === 'reused' ? <>
          <p>This password is also used by:</p>
          <ul className="related-account-list" aria-label="Other accounts sharing this password">{related.map(item => <li key={item.id}>{item.serviceName}</li>)}</ul>
          <p>If one of these accounts is exposed, the same password could be tried on the others.</p>
        </> : <p>This demo password is easy to guess. A stronger one would help protect this account.</p>}
      </InfoCard>
      {account.status !== 'safe' && <Card className="recommendation-card account-recommendation">
        <span className="recommendation-eyebrow">Recommended action</span>
        <h2 className="recommendation-title">Give {account.serviceName} {account.issueType === 'reused' ? 'its own' : 'a stronger'} password.</h2>
        <PrimaryButton className="account-security-action" onClick={() => navigate({ screen: account.issueType === 'reused' ? 'reused-password' : 'weak-password', accountId: account.id })}>Fix this password <ArrowRight size={17} aria-hidden="true" /></PrimaryButton>
      </Card>}
    </>
  );
}
