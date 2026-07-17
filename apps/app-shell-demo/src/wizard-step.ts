export type WizardStep = 1 | 2 | 3 | 4 | 5;

/**
 * Read once at module-eval time, not as a reactive property — this app is embedded via
 * <iframe src="...?step=N">, and the docs site's wizard advances by reloading the iframe's
 * `src` (a full navigation), not by talking to an already-running instance.
 */
function readWizardStep(): WizardStep {
  const raw = Number(new URLSearchParams(location.search).get("step"));
  if (raw >= 1 && raw <= 5) return raw as WizardStep;
  // No/invalid `?step=`: default to the fully-featured demo, so running this app standalone
  // (`pnpm --filter @lit-material/app-shell-demo dev`) shows everything, not a crippled step 1.
  return 5;
}

export const wizardStep: WizardStep = readWizardStep();
