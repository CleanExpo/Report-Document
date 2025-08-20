import { featureFlags } from '@/config/flags';

export default function Home() {
  const flags = featureFlags.getAllFlags();
  
  return (
    <section>
      <h1>NEW PROJECT PATHWAY</h1>
      <p>Vertical slice shell is live. Flags: {JSON.stringify(flags.map(f => ({ name: f.name, enabled: f.enabled })))}</p>
    </section>
  );
}