import { useEffect, useRef } from 'react';
import { ShieldCheck } from 'lucide-react';
import { BottomNavigation } from './components/index.ts';
import { Vault } from './screens/Vault.tsx';
import { Learn } from './screens/Learn.tsx';
import { Security } from './screens/Security.tsx';
import { Settings } from './screens/Settings.tsx';
import { RouteShell } from './screens/RouteShell.tsx';
import { activeSection, useRoute } from './routes.ts';

export function App() {
  const { route, navigate } = useRoute();
  const section = activeSection(route);
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const title = mainRef.current?.querySelector('h1')?.textContent;
    document.title = `${title || 'JU Secure'} · JU Secure`;
    if (firstRender.current) { firstRender.current = false; return; }
    mainRef.current?.focus({ preventScroll: true });
  }, [route]);

  return (
    <div className="app-shell" data-testid="app-shell">
      <a className="skip-link" href="#main-content" onClick={event => {
        event.preventDefault(); mainRef.current?.focus();
      }}>Skip to content</a>
      <header className="brand-header">
        <div className="brand"><ShieldCheck size={23} strokeWidth={1.8} aria-hidden="true" /><span><strong>JU</strong> Secure</span></div>
        <span className="demo-badge">Demo</span>
      </header>
      <main id="main-content" className="page-content" ref={mainRef} tabIndex={-1}>
        {route.screen === 'vault' ? <Vault navigate={navigate} />
          : route.screen === 'learn' ? <Learn />
          : route.screen === 'security' ? <Security navigate={navigate} />
          : route.screen === 'settings' ? <Settings />
          : <RouteShell route={route} navigate={navigate} />}
      </main>
      {section && <BottomNavigation active={section} onNavigate={screen => navigate({ screen })} />}
    </div>
  );
}
