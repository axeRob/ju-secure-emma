import { ArrowRight, BookOpen, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Card, InfoCard, PageHeader, PasswordDisplay, PrimaryButton, StatusPill } from '../components/index.ts';
import { useAppState } from '../state/AppContext.tsx';
import { activeSection } from '../routes.ts';
import type { Route } from '../routes.ts';

const shells = {
  'add-account': { title: 'Add account', subtitle: 'One more account, one safe place.', heading: 'Your next account starts here.', description: 'The demo account form will be added in the next step. You won’t need to enter real credentials.' },
  'reused-password': { title: 'Shared password', subtitle: 'A small change can protect more than one account.', heading: 'Give this account its own password.', description: 'A unique password helps keep one account separate from the others.' },
  'safer-password': { title: 'Safer password', subtitle: 'We’ll make the safe choice easy.', heading: 'A strong password, without the guesswork.', description: 'The guided password step will be added next. A safe default will do the work for you.' },
  'weak-password': { title: 'Stronger password', subtitle: 'Easy for you. Harder to guess.', heading: 'A longer password makes a difference.', description: 'Short, familiar passwords are easier to guess. We’ll guide you to a stronger password in the next step.' },
  success: { title: 'What improved', subtitle: 'See the difference your next step makes.', heading: 'A place for positive progress.', description: 'After completing a security action, this screen will explain which accounts became safer. No action has been completed yet.' },
  'learn-article': { title: 'Learn more', subtitle: 'A little detail, only when you want it.', heading: 'More guidance is on its way.', description: 'Longer articles will be added in a later step. For now, the Learn overview explains why unique passwords matter.' },
  welcome: { title: 'Welcome', subtitle: 'Your student life. A little safer.', heading: 'A calm place for your accounts.', description: 'JU Secure helps you see what matters and take one clear next step. The onboarding experience will be added later.' },
  'create-vault': { title: 'Create vault', subtitle: 'Your accounts, together in one place.', heading: 'A simple start.', description: 'Vault creation is prepared for a later demo step. This prototype won’t ask you for a real master password.' },
  'import-passwords': { title: 'Import passwords', subtitle: 'A simpler way to get started.', heading: 'Bring demo accounts together.', description: 'The import simulation will be added later. No real accounts or passwords will be imported.' },
  unlock: { title: 'Unlock', subtitle: 'Welcome back, Emma.', heading: 'Your vault will be right here.', description: 'The returning-user unlock demonstration is planned for a later step. No real authentication is used.' },
};

export function RouteShell({ route, navigate }: { route: Route; navigate: (route: Route) => void }) {
  const { state } = useAppState();
  const section = activeSection(route) || 'vault';
  const goBack = () => navigate({ screen: section });
  if (route.screen === 'account') {
    const account = state.accounts.find(item => item.id === route.accountId);
    if (!account) return <><PageHeader title="Account not found" onBack={goBack} /><InfoCard><p>This demo account isn’t in the vault.</p></InfoCard><PrimaryButton onClick={goBack}>Back to Vault</PrimaryButton></>;
    return (
      <>
        <PageHeader title="Account details" subtitle="The essentials, all in one place." onBack={goBack} />
        <Card className="account-details">
          <span className="service-mark detail-mark" aria-hidden="true">{account.initial}</span>
          <h2>{account.serviceName}</h2><p>{account.username}</p><StatusPill status={account.status} />
          <PasswordDisplay />
        </Card>
        <InfoCard title={account.status === 'safe' ? 'This account looks good' : 'A clear next step'}>
          <p>{account.status === 'safe' ? 'This demo account has its own strong password.' : account.issueType === 'reused' ? 'This demo password is shared with other accounts. A unique one helps keep this account separate.' : 'This demo password is easy to guess. A stronger one would help protect this account.'}</p>
        </InfoCard>
        {account.status !== 'safe' && <PrimaryButton onClick={() => navigate({ screen: account.issueType === 'reused' ? 'reused-password' : 'weak-password', accountId: account.id })}>See the recommended step <ArrowRight size={17} aria-hidden="true" /></PrimaryButton>}
      </>
    );
  }
  if (!(route.screen in shells)) return <PageHeader title="JU Secure" onBack={goBack} />;
  let content = shells[route.screen as keyof typeof shells];
  if (route.screen === 'reused-password') {
    const account = state.accounts.find(item => item.id === route.accountId);
    if (account?.status === 'reused' && account.reusedGroupId) {
      const relatedAccounts = state.accounts.filter(item => item.id !== account.id && item.status === 'reused' && item.reusedGroupId === account.reusedGroupId);
      const names = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' }).format([account.serviceName, ...relatedAccounts.map(item => item.serviceName)]);
      content = {
        ...content,
        heading: `Give ${account.serviceName} its own password.`,
        description: `${names} share the same demo password. If one account leaks it, the others could be affected too. A unique password keeps them separate.`,
      };
    }
  }
  const Icon = route.screen === 'learn-article' ? BookOpen : route.screen === 'unlock' ? LockKeyhole : route.screen === 'add-account' ? KeyRound : ShieldCheck;
  return (
    <>
      <PageHeader title={content.title} subtitle={content.subtitle} onBack={goBack} />
      <Card className="workflow-shell"><span className="shell-icon"><Icon size={25} strokeWidth={1.6} aria-hidden="true" /></span><h2>{content.heading}</h2><p>{content.description}</p><span className="soon-pill">Next implementation step</span></Card>
      <PrimaryButton onClick={goBack}>Back to {section.charAt(0).toUpperCase() + section.slice(1)} <ArrowRight size={17} aria-hidden="true" /></PrimaryButton>
    </>
  );
}
