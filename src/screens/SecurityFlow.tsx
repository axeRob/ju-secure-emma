import { useEffect, useRef, useState } from 'react';
import { Check, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Card, InfoCard, PageHeader, PasswordDisplay, PrimaryButton, SecondaryButton, SuccessCard, TextAction } from '../components/index.ts';
import { generateDemoPassword } from '../data/passwords.ts';
import { useAppState } from '../state/AppContext.tsx';
import { getRecommendedAccount, getRelatedAccounts } from '../state/security.ts';
import { AccountNotFound } from './AccountDetails.tsx';
import type { Route } from '../routes.ts';
import type { ResolutionSummary, SecuritySummary } from '../types/index.ts';

type NavigationProps = { accountId: string; navigate: (route: Route) => void; onCancel: () => void; onBack?: () => void };
const listNames = (names: string[]) => new Intl.ListFormat('en', { style: 'long', type: 'conjunction' }).format(names);
const summaryText = (summary: SecuritySummary) => `${summary.safe} safe · ${summary.reused} reused · ${summary.weak} weak`;

export function SecurityProblem({ accountId, navigate, onCancel, onBack = onCancel }: NavigationProps) {
  const { state } = useAppState();
  const account = state.accounts.find(item => item.id === accountId);
  if (!account) return <AccountNotFound navigate={navigate} />;
  const reused = account.issueType === 'reused';
  const related = getRelatedAccounts(state.accounts, account.id);
  return (
    <>
      <PageHeader title={account.status === 'safe' ? 'Account security' : reused ? 'Shared password' : 'Weak password'} subtitle={account.status === 'safe' ? undefined : reused ? 'A small change can protect more than one account.' : 'Easy for you. Harder to guess.'} onBack={onBack} />
      <div className="screen-stack">
        {account.status === 'safe' ? <>
          <SuccessCard title={`${account.serviceName} looks good`}><p>This demo account already has its own strong password.</p></SuccessCard>
          <PrimaryButton onClick={onBack}>Back to your accounts</PrimaryButton>
        </> : <>
          <Card className="problem-card">
            <span className="shell-icon"><ShieldCheck size={25} aria-hidden="true" /></span>
            <h2>{reused ? `One password currently protects ${related.length + 1} accounts` : 'This password is easy to guess.'}</h2>
            {reused ? <><ul className="affected-account-list">{[account, ...related].map(item => <li key={item.id}>{item.serviceName}</li>)}</ul><p>These accounts use the same demo password.</p></> : <p>{account.serviceName} uses a short or common demo password.</p>}
          </Card>
          <InfoCard title="Why this matters"><p>{reused ? `If one account is exposed, someone could try the same password on the other ${related.length} ${related.length === 1 ? 'account' : 'accounts'}.` : 'Short or common passwords may be easier for someone else to guess.'}</p></InfoCard>
          <InfoCard title="What we recommend"><p>{reused ? `Give ${account.serviceName} its own password.` : `Replace ${account.serviceName}’s password with a strong one.`}</p></InfoCard>
          <div className="screen-actions">
            <PrimaryButton onClick={() => navigate({ screen: 'safer-password', accountId: account.id })}>Fix this for me</PrimaryButton>
            <p className="simulation-note">JU Secure will create the recommended password for you.</p>
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
        <SuccessCard title="Safe defaults are on">
          <p>We prepared the recommended password. You don’t need to choose any settings.</p>
          <ul className="safe-option-checklist">
            {['Unique password', 'Strong password', 'Safe password settings already selected', 'Saved automatically when you finish', 'You don’t need to remember it'].map(item => <li key={item}><Check size={16} aria-hidden="true" /><span>{item}</span></li>)}
          </ul>
        </SuccessCard>
        <div className="screen-actions">
          <PrimaryButton onClick={simulateChange} disabled={phase !== 'ready'}>{phase === 'ready' ? 'Use recommended password' : phase === 'changing' ? 'Changing password…' : 'Password changed'}</PrimaryButton>
          {phase === 'ready' && <p className="simulation-note">We’ll guide you through the rest.</p>}
          <p className="simulation-note" role="status" aria-live="polite">{phase === 'ready' ? 'Demo simulation. No service will be opened.' : phase === 'changing' ? 'Changing password… in this demo only.' : 'Password changed in the demo.'}</p>
          {phase === 'ready' && <SecondaryButton onClick={onCancel}>Not now</SecondaryButton>}
        </div>
        <InfoCard title="What happens next"><ol className="next-steps"><li>Use the recommended password.</li><li>We simulate the change for {account.serviceName}.</li><li>JU Secure saves the new demo password automatically.</li></ol><p className="optional-copy-note">Copy is available if you want to try it; you can complete this demo without copying.</p></InfoCard>
      </div>
    </>
  );
}

export function SecuritySuccess({ navigate }: { navigate: (route: Route) => void }) {
  const { state } = useAppState();
  const result = state.lastResolution;
  if (!result) return <><PageHeader title="Your next step" /><div className="screen-stack"><InfoCard title="Start with an account"><p>Choose an account that needs attention to see what improves.</p></InfoCard><PrimaryButton onClick={() => navigate({ screen: 'vault' })}>Back to vault</PrimaryButton></div></>;
  const reused = result.issueType === 'reused';
  const nextAccount = getRecommendedAccount(state.accounts);
  const problemsFixed = result.before.needsAttention - result.after.needsAttention;
  return (
    <>
      <PageHeader title="Nice work!" />
      <div className="screen-stack">
        <Card className="success-feedback">
          <CheckCircle2 className="success-feedback-icon" size={42} strokeWidth={1.5} aria-hidden="true" />
          <h2>{result.serviceName} now has {reused ? 'its own' : 'a stronger'} password.</h2>
          {reused && result.relatedServiceNames.length > 0 ? <><p>{result.serviceName} no longer shares its password with {listNames(result.relatedServiceNames)}.</p><p>If {result.serviceName} has a problem, the password used by the other accounts is still separate.</p></> : <p>A longer, unique demo password makes this account harder to guess.</p>}
        </Card>
        {reused && <ReuseComparison result={result} />}
        <Card className="progress-card">
          <h2>Your vault is safer</h2>
          <dl><div><dt>Before</dt><dd>{summaryText(result.before)}</dd></div><div><dt>Now</dt><dd>{summaryText(result.after)}</dd></div></dl>
          <p className="problems-fixed"><CheckCircle2 size={16} aria-hidden="true" />{problemsFixed} {problemsFixed === 1 ? 'problem' : 'problems'} fixed.</p>
        </Card>
        <div className="screen-actions">
          <PrimaryButton onClick={() => navigate({ screen: 'vault' })}>Back to vault</PrimaryButton>
        </div>
        {nextAccount && <Card className="next-account-card">
          <h2>Want to improve one more account?</h2>
          <p>{nextAccount.serviceName} {nextAccount.issueType === 'reused' ? 'still shares a password.' : 'still has a password that is easy to guess.'}</p>
          <SecondaryButton onClick={() => navigate({ screen: nextAccount.issueType === 'reused' ? 'reused-password' : 'weak-password', accountId: nextAccount.id })}>Fix the next account</SecondaryButton>
          <p className="next-account-optional">Only if you want to. You can stop here.</p>
        </Card>}
        <TextAction onClick={() => navigate({ screen: 'learn-article', articleId: 'unique-passwords' })}>Why unique passwords help</TextAction>
      </div>
    </>
  );
}

function ReuseComparison({ result }: { result: ResolutionSummary }) {
  const peers = result.relatedAccountsAfter ?? [];
  const stillShared = peers.filter(account => account.status === 'reused');
  const nowUnique = peers.filter(account => account.status === 'safe');
  const stillWeak = peers.filter(account => account.status === 'weak');
  return <Card className="reuse-progress-card">
    <h2>What changed</h2>
    <div className="reuse-comparison" data-testid="reuse-comparison">
      <section className="reuse-comparison-panel" aria-label="Before the demo change" data-testid="before-reuse-group">
        <h3>Before</h3><p className="comparison-caption">Same password</p>
        <ul className="connected-accounts">{[result.serviceName, ...result.relatedServiceNames].map((name, index) => <li key={index}>{name}</li>)}</ul>
      </section>
      <section className="reuse-comparison-panel" aria-label="After the demo change" data-testid="after-reuse-group">
        <h3>Now</h3>
        <ul className="unique-accounts"><li><span>{result.serviceName}</span><span className="comparison-unique"><Check size={14} aria-hidden="true" />Unique</span></li></ul>
        {stillShared.length > 0 && <><p className="comparison-caption remaining-accounts-caption">Still sharing a password</p><ul className="connected-accounts">{stillShared.map(account => <li key={account.id}>{account.serviceName}</li>)}</ul></>}
        {nowUnique.length > 0 && <><p className="comparison-caption remaining-accounts-caption">Own passwords</p><ul className="unique-accounts">{nowUnique.map(account => <li key={account.id}><span>{account.serviceName}</span><span className="comparison-unique"><Check size={14} aria-hidden="true" />Unique</span></li>)}</ul></>}
        {stillWeak.length > 0 && <><p className="comparison-caption remaining-accounts-caption">Still needs a stronger password</p><ul className="comparison-weak-accounts">{stillWeak.map(account => <li key={account.id}>{account.serviceName}</li>)}</ul></>}
      </section>
    </div>
  </Card>;
}
