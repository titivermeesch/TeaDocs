import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import type { ReactNode } from 'react';
import styles from './index.module.css';

const deploymentModes = [
    {
        title: 'Single server',
        subtitle: 'One Paper (or Spigot) server hosts lobby + games',
        body: 'Arenas live on the same server players connect to. Pool manager scales locally. Simplest to run; perfect for small communities.',
        config: 'arena-pool.mode: standalone',
        href: '/docs/tea/user/configuring-network-mode#standalone',
    },
    {
        title: 'Lobby + shared arena servers',
        subtitle: 'Many arenas per server, leader-coordinated',
        body: 'A proxy (BungeeCord or Velocity) sends players onto a lobby; arenas spread across arena servers. The matchmaker leader balances new allocations across available servers via Redis.',
        config: 'arena-pool.mode: central',
        href: '/docs/tea/user/configuring-network-mode#central',
    },
    {
        title: 'One game per pod',
        subtitle: 'External orchestrator handles scaling',
        body: 'Kubernetes (or similar) boots a fresh pod per match. TeaCore does not scale; each pod hosts one arena and shuts down on match end.',
        config: 'arena-pool.mode: external',
        href: '/docs/tea/user/configuring-network-mode#external',
    },
];

const features = [
    {
        emoji: '⚔',
        title: 'Arena lifecycle + warm pool',
        body: 'WAITING → COUNTDOWN → STARTING → LIVE → ENDING state machine. Pre-allocated arenas so players never wait on a schematic paste.',
    },
    {
        emoji: '🗺',
        title: 'In-game map authoring',
        body: '/tea map create - build your arena in a throwaway void world, mark spawns, save. Schematic capture handled for you.',
    },
    {
        emoji: '📦',
        title: 'Kit + ability framework',
        body: 'Kits bundle items and ability bindings. Abilities are Java classes that get cooldown tracking, trigger wiring, and effect bundles for free.',
    },
    {
        emoji: '🌐',
        title: 'Proxy-aware networking',
        body: 'Redis-backed coordination for multi-server fleets. Queue, arena snapshots, matchmaker leader election, cross-server control commands.',
    },
    {
        emoji: '💬',
        title: 'Per-arena chat routing',
        body: 'Chat is scoped to the arena by default. Team / staff / global channels are opt-in. Nobody leaks match banter to the lobby.',
    },
    {
        emoji: '📊',
        title: 'Embedded web dashboard',
        body: 'Every running arena, queue, and player on one React page served by the plugin itself. View, filter, start, release, allocate from the browser.',
    },
];

function Hero() {
    return (
        <header className={styles.hero}>
            <div className={styles.heroInner}>
                <h1 className={styles.heroTitle}>
                    <span className={styles.heroAccent}>Tea</span> Minigames
                </h1>
                <p className={styles.heroTagline}>
                    A reusable Spigot minigames engine (1.20.5+). Arenas, kits, queues, cross-server
                    matchmaking, and a web dashboard - so your game plugin can focus on gameplay.
                </p>
                <div className={styles.heroActions}>
                    <Link className="button button--primary button--lg" to="/docs/tea/user/installing">
                        Get started
                    </Link>
                    <Link
                        className="button button--secondary button--lg"
                        to="/docs/tea/dev/extending-with-a-new-game"
                    >
                        Build a game
                    </Link>
                </div>
            </div>
        </header>
    );
}

function ModesSection() {
    return (
        <section className={styles.section}>
            <div className={styles.sectionInner}>
                <h2>Pick a deployment shape</h2>
                <p className={styles.sectionSub}>
                    TeaCore supports three arena-pool modes so you can run it the way your fleet actually runs.
                </p>
                <div className={styles.modeGrid}>
                    {deploymentModes.map((m) => (
                        <Link key={m.title} to={m.href} className={styles.modeCard}>
                            <h3 className={styles.modeTitle}>{m.title}</h3>
                            <div className={styles.modeSubtitle}>{m.subtitle}</div>
                            <p className={styles.modeBody}>{m.body}</p>
                            <code className={styles.modeConfig}>{m.config}</code>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

function FeaturesSection() {
    return (
        <section className={styles.sectionAlt}>
            <div className={styles.sectionInner}>
                <h2>What's in the box</h2>
                <div className={styles.featureGrid}>
                    {features.map((f) => (
                        <div key={f.title} className={styles.featureCard}>
                            <div className={styles.featureEmoji}>{f.emoji}</div>
                            <h3>{f.title}</h3>
                            <p>{f.body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function AscendCallout() {
    return (
        <section className={styles.section}>
            <div className={styles.sectionInner}>
                <div className={styles.callout}>
                    <div>
                        <h2>The flagship game: Ascend</h2>
                        <p>
                            A classic evolution-style minigame built entirely on Tea. Evolve through
                            mob stages, land kills, climb the ladder. The whole game is a reference implementation
                            of the engine.
                        </p>
                    </div>
                    <Link className="button button--primary button--lg" to="/docs/ascend/user/installing">
                        Install Ascend
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default function Home(): ReactNode {
    return (
        <Layout
            title="Tea Minigames - Spigot minigames engine"
            description="A reusable Spigot (1.20.5+) minigames engine: arenas, kits, queues, cross-server matchmaking, and a web dashboard."
        >
            <Hero />
            <main>
                <ModesSection />
                <FeaturesSection />
                <AscendCallout />
            </main>
        </Layout>
    );
}
