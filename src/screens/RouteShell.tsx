import { ShieldCheck } from 'lucide-react';
import { Card, PageHeader, PrimaryButton } from '../components/index.ts';
import type { Route } from '../routes.ts';

// Informational entry screens remain outside the requested interactive journeys.
const entryScreens = {
  welcome: { title: 'Welcome', subtitle: 'Your student life. A little safer.', heading: 'A calm place for your accounts.', description: 'Try Emma’s fictitious accounts and practise safer password habits, one step at a time.' },
  'create-vault': { title: 'Create vault', subtitle: 'Your accounts, together in one place.', heading: 'Your demo vault is ready.', description: 'Emma’s sample accounts are ready to explore. This educational demo does not need a real master password.' },
  'import-passwords': { title: 'Import passwords', subtitle: 'A simpler way to get started.', heading: 'Explore the sample accounts.', description: 'This demo uses fictitious accounts. No files or real passwords are imported.' },
  unlock: { title: 'Unlock', subtitle: 'Welcome back, Emma.', heading: 'Open your demo vault.', description: 'Explore the demo without a real password. Accounts and preferences reset when you reload the page.' },
};

export function RouteShell({ route, navigate }: { route: Route; navigate: (route: Route) => void }) {
  const openVault = () => navigate({ screen: 'vault' });
  const content = Object.hasOwn(entryScreens, route.screen) ? entryScreens[route.screen as keyof typeof entryScreens] : entryScreens.welcome;
  return <><PageHeader title={content.title} subtitle={content.subtitle} onBack={openVault} /><Card className="workflow-shell"><span className="shell-icon"><ShieldCheck size={25} aria-hidden="true" /></span><h2>{content.heading}</h2><p>{content.description}</p></Card><PrimaryButton onClick={openVault}>Open demo vault</PrimaryButton></>;
}
