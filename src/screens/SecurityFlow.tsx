import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { Card, InfoCard, PageHeader, PasswordDisplay, PrimaryButton, SecondaryButton, SuccessCard } from '../components/index.ts';
import { generateDemoPassword } from '../data/passwords.ts';
import { useAppState } from '../state/AppContext.tsx';
import { getRelatedAccounts } from '../state/security.ts';
import { AccountNotFound } from './AccountDetails.tsx';
import type { Route } from '../routes.ts';
import type { SecuritySummary } from '../types/index.ts';

type NavigationProps = { accountId: string; navigate: (route: Route) => void; onCancel: () => void };
const listNames = (names: string[]) => new Intl.ListFormat('en', { style: 'long', type: 'conjunction' }).format(names);
const summaryText = (summary: SecuritySummary) => `${summary.safe} safe · ${summary.reused} reused · ${summary.weak} weak`;

export function SecurityProblem({ accountId, navigate, onCancel }: NavigationProps) {
  const { state } = useAppState();
  const account = state.accounts.find(item => item.id === accountId);
  if (!account) return <AccountNotFound navigate={navigate} />;
  const reused = account.issueType === 'reused';
  const related = getRelatedAccounts(state.accounts, account.id);
  return (
    <>
      <PageHeader title={account.status === 'safe' ? 'Account security' : reused ? 'Shared password' : 'Weak password'} subtitle={account.status === 'safe' ? undefined : reused ? 'A small change can protect more than one account.' : 'Easy for you. Harder to guess.'} onBack={onCancel} />
      <div className="screen-stack">
        {account.status === 'safe' ? <>
          <SuccessCard title={`${account.serviceName} looks good`}><p>This demo account already has its own strong password.</p></SuccessCard>
          <PrimaryButton onClick={onCancel}>Back to your accounts</PrimaryButton>
        </> : <>
          <Card className="problem-card">
            <span className="shell-icon"><ShieldCheck size={25} aria-hidden="true" /></span>
            <h2>{reused ? `Give ${account.serviceName} its own password.` : 'Create a stronger password.'}</h2>
            <p>{reused ? `${listNames([account.serviceName, ...related.map(item => item.serviceName)])} use the same password. If one account is exposed, someone could try that password on the others.` : 'This password is short or easy to guess.'}</p>
          </Card>
          <InfoCard title="Why this matters"><p>{reused ? 'Using a different password for each account keeps one problem from spreading to your other accounts.' : 'An easier password may be easier for someone else to guess too.'}</p></InfoCard>
          <div className="screen-actions">
            <PrimaryButton onClick={() => navigate({ screen: 'safer-password', accountId: account.id })}>{reused ? 'Generate a unique password' : 'Generate a stronger password'}</PrimaryButton>
            <SecondaryButton onClick={onCancel}>Not now</SecondaryButton>
          </div>
        </>}
      </div>
    </>
  );
}

export function SaferPassword({ accountId, navigate, onCancel }: NavigationProps) {
  const { state, dispatch } = useAppState();
  const account = state.accounts.find(item => item.id === accountId);
  const [demoPassword, setDemoPassword] = useState(() => generateDemoPassword(state.accounts.map(item => item.demoPassword)));
  const [phase, setPhase] = useState<'ready' | 'changing' | 'changed'>('ready');
  const timers = useRef<number[]>([]);
  const busy = useRef(false);
  useEffect(() => () => { timers.current.forEach(timer => window.clearTimeout(timer)); }, []);
  if (!account) return <AccountNotFound navigate={navigate} />;
  if (account.status === 'safe') return <><PageHeader title="Safer password" onBack={onCancel} /><div className="screen-stack"><SuccessCard title={`${account.serviceName} already has its own password`}><p>This account already uses a strong, unique demo password.</p></SuccessCard><PrimaryButton onClick={() => navigate({ screen: 'vault' })}>Back to vault</PrimaryButton></div></>;

  const simulateChange = () => {
    if (busy.current) return;
    busy.current = true;
    setPhase('changing');
    timers.current.push(window.setTimeout(() => {
      setPhase('changed');
      timers.current.push(window.setTimeout(() => {
        dispatch({ type: 'resolve-issue', accountId: account.id, demoPassword });
        navigate({ screen: 'success' });
      }, 250));
    }, 1000));
  };
  const backToProblem = () => navigate({ screen: account.issueType === 'reused' ? 'reused-password' : 'weak-password', accountId: account.id });

  return (
    <>
      <PageHeader title="Safer password" subtitle="The safest option is already selected." onBack={backToProblem} />
      <div className="screen-stack">
        <Card className="generated-password-card">
          <div className="generated-password-heading"><h2>For {account.serviceName}</h2><span className="strength-label"><CheckCircle2 size={15} aria-hidden="true" />Very strong</span></div>
          <PasswordDisplay value={demoPassword} label="Generated demo password" defaultVisible />
          <p className="password-detail">{demoPassword.length} characters · letters · numbers · symbols</p>
          <SecondaryButton onClick={() => setDemoPassword(generateDemoPassword(state.accounts.map(item => item.demoPassword), demoPassword))} disabled={phase !== 'ready'}>Generate another</SecondaryButton>
        </Card>
        <SuccessCard title="Safe defaults are on"><p>We use a long, unique password automatically. You don’t need to change any settings.</p></SuccessCard>
        <p className="flow-supporting-copy">You do not need to remember this password. JU Secure keeps the demo value for you.</p>
        <InfoCard title="What happens next"><ol className="next-steps"><li>Copy the new password.</li><li>Change your password on {account.serviceName}.</li><li>JU Secure saves the new demo password.</li></ol></InfoCard>
        <div className="screen-actions">
          <PrimaryButton onClick={simulateChange} disabled={phase !== 'ready'}>{phase === 'ready' ? `Open ${account.serviceName} and change password` : phase === 'changing' ? 'Changing password…' : 'Password changed'}</PrimaryButton>
          <p className="simulation-note" role="status" aria-live="polite">{phase === 'ready' ? 'Demo simulation. No service will be opened.' : phase === 'changing' ? 'Changing password… in this demo only.' : 'Password changed in the demo.'}</p>
          {phase === 'ready' && <SecondaryButton onClick={onCancel}>Not now</SecondaryButton>}
        </div>
      </div>
    </>
  );
}

export function SecuritySuccess({ navigate }: { navigate: (route: Route) => void }) {
  const { state } = useAppState();
  const result = state.lastResolution;
  if (!result) return <><PageHeader title="Your next step" /><div className="screen-stack"><InfoCard title="Start with an account"><p>Choose an account that needs attention to see what improves.</p></InfoCard><PrimaryButton onClick={() => navigate({ screen: 'vault' })}>Back to vault</PrimaryButton></div></>;
  const reused = result.issueType === 'reused';
  return (
    <>
      <PageHeader title="Nice work" />
      <div className="screen-stack">
        <Card className="success-feedback">
          <CheckCircle2 className="success-feedback-icon" size={42} strokeWidth={1.5} aria-hidden="true" />
          <h2>{result.serviceName} now has {reused ? 'its own' : 'a stronger'} password.</h2>
          {reused && result.relatedServiceNames.length > 0 ? <><p>{result.serviceName} no longer shares its password with {listNames(result.relatedServiceNames)}.</p><p>If {result.serviceName} has a problem, the password used by the other accounts is still separate.</p></> : <p>A longer, unique demo password makes this account harder to guess.</p>}
        </Card>
        <Card className="progress-card">
          <h2>Your vault is safer</h2>
          <dl><div><dt>Before</dt><dd>{summaryText(result.before)}</dd></div><div><dt>Now</dt><dd>{summaryText(result.after)}</dd></div></dl>
        </Card>
        <div className="screen-actions">
          <PrimaryButton onClick={() => navigate({ screen: 'vault' })}>Back to vault</PrimaryButton>
          <SecondaryButton onClick={() => navigate({ screen: 'learn-article', articleId: 'unique-passwords' })}>Why unique passwords help</SecondaryButton>
        </div>
      </div>
    </>
  );
}
