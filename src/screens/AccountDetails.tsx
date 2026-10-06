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
  const names = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' }).format(related.map(item => item.serviceName));
  return (
    <>
      <PageHeader title="Account details" subtitle="The essentials, all in one place." onBack={() => navigate({ screen: 'vault' })} />
      <Card className="account-details">
        <span className="service-mark detail-mark" aria-hidden="true">{account.initial}</span>
        <h2>{account.serviceName}</h2><p>{account.username}</p><StatusPill status={account.status} />
        <PasswordDisplay value={account.demoPassword} />
      </Card>
      <InfoCard title={account.status === 'safe' ? 'This account looks good' : 'A clear next step'}>
        <p>{account.status === 'safe' ? 'This demo account has its own strong password.' : account.issueType === 'reused' ? `This password is also used by ${names}. A unique password helps keep this account separate.` : 'This demo password is short or easy to guess. A stronger one would help protect this account.'}</p>
      </InfoCard>
      {account.status !== 'safe' && <PrimaryButton className="account-security-action" onClick={() => navigate({ screen: account.issueType === 'reused' ? 'reused-password' : 'weak-password', accountId: account.id })}>See the recommended step <ArrowRight size={17} aria-hidden="true" /></PrimaryButton>}
    </>
  );
}
