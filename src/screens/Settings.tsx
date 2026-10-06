import { HeartHandshake, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Card, InfoCard, PageHeader, SettingsRow, Toggle } from '../components/index.ts';
import { useAppState } from '../state/AppContext.tsx';

export function Settings() {
  const { state } = useAppState();
  return (
    <>
      <PageHeader title="Settings" subtitle="Simple by default. Safer by design." />
      <Card className="persona-card"><span className="persona-avatar" aria-hidden="true">E</span><div><h2>Emma’s vault</h2><p>Student demo</p></div><ShieldCheck size={20} aria-hidden="true" /></Card>
      <div className="section-heading settings-heading"><h2>Safe defaults</h2><span className="soon-pill">Coming next</span></div>
      <Card className="settings-group">
        <SettingsRow icon={LockKeyhole} title="Automatic lock" description="Keep your vault closed when you step away.">
          <Toggle label="Automatic lock — coming next" checked={state.settings.autoLock} disabled onChange={() => {}} />
        </SettingsRow>
        <SettingsRow icon={HeartHandshake} title="Helpful guidance" description="Clear explanations when something needs attention.">
          <Toggle label="Helpful guidance — coming next" checked={state.settings.securityGuidance} disabled onChange={() => {}} />
        </SettingsRow>
      </Card>
      <InfoCard title="A space to try things out"><p>This is an educational prototype with demo accounts. It doesn’t store real passwords or connect to your accounts.</p></InfoCard>
      <div className="about-app"><div className="about-wordmark">JU Secure</div><p>Made for student life.</p><span>Emma prototype · v0.1</span></div>
    </>
  );
}
