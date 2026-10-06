import { HeartHandshake, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Card, InfoCard, PageHeader, SettingsRow, Toggle } from '../components/index.ts';
import { useAppState } from '../state/AppContext.tsx';

export function Settings() {
  const { state, dispatch } = useAppState();
  return (
    <>
      <PageHeader title="Settings" subtitle="Simple by default. Safer by design." />
      <Card className="persona-card"><span className="persona-avatar" aria-hidden="true">E</span><div><h2>Emma’s vault</h2><p>Student demo</p></div><ShieldCheck size={20} aria-hidden="true" /></Card>
      <div className="section-heading settings-heading"><h2>Safe defaults</h2></div>
      <InfoCard className="settings-defaults-note" title={state.settings.autoLock && state.settings.securityGuidance ? 'Safe defaults are already on' : 'Simple preferences, safe recommendations'}>
        <p>JU Secure starts with the recommended protection. You can change simple preferences if you want.</p>
      </InfoCard>
      <Card className="settings-group">
        <SettingsRow icon={LockKeyhole} title="Automatic lock" description="Lock JU Secure automatically when you step away.">
          <Toggle label="Automatic lock" checked={state.settings.autoLock}
            onChange={autoLock => dispatch({ type: 'update-settings', settings: { autoLock } })} />
        </SettingsRow>
        <SettingsRow icon={HeartHandshake} title="Helpful guidance" description="Show simple explanations when something needs attention.">
          <Toggle label="Helpful guidance" checked={state.settings.securityGuidance}
            onChange={securityGuidance => dispatch({ type: 'update-settings', settings: { securityGuidance } })} />
        </SettingsRow>
      </Card>
      {!state.settings.autoLock && <p className="form-help settings-preference-note">Keeping automatic lock on is recommended.</p>}
      <InfoCard title="A space to try things out"><p>This is an educational prototype with demo accounts. It doesn’t store real passwords or connect to your accounts.</p></InfoCard>
      <div className="about-app"><div className="about-wordmark">JU Secure</div><p>Made for student life.</p><span>Emma prototype · v0.1</span></div>
    </>
  );
}
