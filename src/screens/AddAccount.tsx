import { useState } from 'react';
import type { FormEvent } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { Card, InfoCard, PageHeader, PasswordDisplay, PrimaryButton } from '../components/index.ts';
import { generateDemoPassword } from '../data/passwords.ts';
import type { Route } from '../routes.ts';
import { useAppState } from '../state/AppContext.tsx';

type PasswordChoice = 'generated' | 'existing-demo';

const WEAK_DEMO_PASSWORDS = ['DEMO-123', 'DEMO-abc'] as const;

export function AddAccount({ navigate, onAdded }: { navigate: (route: Route) => void; onAdded: () => void }) {
  const { state, dispatch } = useAppState();
  const [serviceName, setServiceName] = useState('Demo Study App');
  const [username, setUsername] = useState('emma@example.com');
  const [passwordChoice, setPasswordChoice] = useState<PasswordChoice>('generated');
  const [generatedPassword, setGeneratedPassword] = useState(() =>
    generateDemoPassword(state.accounts.map(account => account.demoPassword)),
  );
  const [existingDemoPassword, setExistingDemoPassword] = useState<string>(WEAK_DEMO_PASSWORDS[0]);
  const [formError, setFormError] = useState('');

  const selectGeneratedPassword = () => {
    setGeneratedPassword(generateDemoPassword(
      state.accounts.map(account => account.demoPassword),
      generatedPassword,
    ));
    setPasswordChoice('generated');
  };

  const addAccount = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const demoService = serviceName.trim();
    const demoUsername = username.trim();
    if (!demoService || !demoUsername) {
      setFormError('Add a demo app name and a demo email or username.');
      return;
    }

    const isStrong = passwordChoice === 'generated';
    const baseId = demoService.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'account';
    const initial = demoService.split(/\s+/).map(word => word[0]).join('').slice(0, 2).toUpperCase();
    dispatch({
      type: 'add-account',
      account: {
        id: `demo-${baseId}`,
        serviceName: demoService,
        username: demoUsername,
        status: isStrong ? 'safe' : 'weak',
        issueType: isStrong ? 'none' : 'weak',
        passwordStrength: isStrong ? 'strong' : 'weak',
        reusedGroupId: null,
        initial,
        demoPassword: isStrong ? generatedPassword : existingDemoPassword,
      },
    });
    dispatch({ type: 'set-filter', filter: 'all' });
    onAdded();
  };

  return (
    <>
      <PageHeader title="Add account" subtitle="One more demo account, one safe place." onBack={() => navigate({ screen: 'vault' })} />
      <div className="screen-stack">
        <InfoCard title="Try a demo account">
          <p>Use made-up details only. This prototype does not connect to accounts or store real credentials.</p>
        </InfoCard>
        <form className="demo-account-form screen-stack" onSubmit={addAccount} autoComplete="off">
          <Card className="screen-stack">
            <div className="form-field">
              <label className="form-label" htmlFor="demo-service">Website or app</label>
              <input className="form-input" id="demo-service" name="demo-service" value={serviceName}
                placeholder="Demo Study App" maxLength={60} required autoComplete="off"
                onChange={event => { setServiceName(event.target.value); setFormError(''); }} />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="demo-username">Email / username</label>
              <input className="form-input" id="demo-username" name="demo-username" value={username}
                placeholder="emma@example.com" maxLength={80} required autoComplete="off" spellCheck={false}
                onChange={event => { setUsername(event.target.value); setFormError(''); }} />
            </div>
            <fieldset className="password-options">
              <legend className="form-label">Password</legend>
              <button type="button" className={`password-option${passwordChoice === 'generated' ? ' password-option-selected' : ''}`}
                aria-pressed={passwordChoice === 'generated'} onClick={selectGeneratedPassword}>
                <Sparkles size={17} aria-hidden="true" />
                <span>Generate a strong password</span>
                {passwordChoice === 'generated' && <Check size={17} aria-hidden="true" />}
              </button>
              <button type="button" className={`password-option${passwordChoice === 'existing-demo' ? ' password-option-selected' : ''}`}
                aria-pressed={passwordChoice === 'existing-demo'} onClick={() => setPasswordChoice('existing-demo')}>
                <span>I already have a password</span>
                {passwordChoice === 'existing-demo' && <Check size={17} aria-hidden="true" />}
              </button>
            </fieldset>
            {passwordChoice === 'generated' ? (
              <div>
                <PasswordDisplay value={generatedPassword} label="Generated demo password" defaultVisible />
                <p className="form-help">A strong, unique demo value is selected for you. You do not need to remember it.</p>
              </div>
            ) : (
              <div className="form-field">
                <label className="form-label" htmlFor="existing-demo-password">Choose a demo password</label>
                <select className="form-input" id="existing-demo-password" value={existingDemoPassword}
                  onChange={event => setExistingDemoPassword(event.target.value)} aria-describedby="existing-demo-help">
                  {WEAK_DEMO_PASSWORDS.map(password => <option key={password} value={password}>{password} — weak demo example</option>)}
                </select>
                <p className="form-help" id="existing-demo-help">These made-up examples are easy to guess. The account will need attention until you make it stronger.</p>
              </div>
            )}
          </Card>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <PrimaryButton type="submit">Add account</PrimaryButton>
        </form>
      </div>
    </>
  );
}
