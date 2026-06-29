import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEMO_WALKTHROUGH } from '../utils/demoData';
import { useUI } from '../context/UIContext';

export default function TestingPanel() {
  const { state, dispatch } = useApp();
  const { showToast, confirm } = useUI();
  const [expanded, setExpanded] = useState(false);
  const hasData = state.groups.length > 0;

  async function loadDemo() {
    if (hasData) {
      const ok = await confirm({
        title: 'Load demo data?',
        message: 'This will replace all current data with demo data.',
        confirmLabel: 'Load demo',
      });
      if (!ok) return;
    }
    dispatch({ type: 'LOAD_DEMO_DATA' });
    setExpanded(true);
    showToast('Demo data loaded.', 'info');
  }

  async function clearData() {
    const ok = await confirm({
      title: 'Clear all data?',
      message: 'Clear all groups, expenses, and activity? This cannot be undone.',
      confirmLabel: 'Clear all',
      danger: true,
    });
    if (ok) {
      dispatch({ type: 'RESET_DATA' });
      setExpanded(false);
      showToast('All data cleared.');
    }
  }

  return (
    <div className="testing-panel">
      <button
        type="button"
        className="testing-panel__toggle"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? '− Hide testing tools' : '+ Testing & demo data'}
      </button>

      {expanded && (
        <div className="receipt receipt--torn-top">
          <div className="receipt__body">
            <div className="receipt__section-label">Try the app quickly</div>
            <p className="testing-panel__intro">
              Load sample roommates and trip data to explore every feature without
              setting things up manually.
            </p>

            <div className="page-actions page-actions--top">
              <button
                type="button"
                className="btn btn--primary"
                onClick={loadDemo}
              >
                Load Demo Data
              </button>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={clearData}
                disabled={!hasData}
              >
                Clear All Data
              </button>
            </div>

            <hr className="receipt__divider receipt__divider--light" />

            <div className="receipt__section-label">Suggested walkthrough</div>
            <ol className="testing-panel__walkthrough">
              {DEMO_WALKTHROUGH.map((section) => (
                <li key={section.title}>
                  <strong>{section.title}</strong>
                  <ul>
                    {section.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
