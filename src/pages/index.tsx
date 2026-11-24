import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import type { ReactNode } from 'react';
import styles from './index.module.css';

const deploymentModes = [
    {
        title: 'Single server',
        subtitle: 'One Paper (or Spigot) server hosts lobby + games',
        body: 'Arenas live on the same server players connect to, and the pool manager scales them locally. It is the easiest setup to run and suits small communities.',
        config: 'arena-pool.mode: standalone',
        href: '/docs/tea/user/configuring-network-mode#standalone',
    },
    {
        title: 'Lobby + shared arena servers',
        subtitle: 'Many arenas per server, leader-coordinated',
        body: 'A proxy (BungeeCord or Velocity) sends players to a lobby, and arenas spread across arena servers. The matchmaker leader uses Redis to place new arenas on the least-loaded server.',
        config: 'arena-pool.mode: central',
        href: '/docs/tea/user/configuring-network-mode#central',
    },
    {
        title: 'One game per pod',
        subtitle: 'External orchestrator handles scaling',
        body: 'Kubernetes (or a similar orchestrator) boots a fresh pod per match. TeaCore does no scaling: each pod hosts one arena and shuts down when the match ends.',
        config: 'arena-pool.mode: external',
        href: '/docs/tea/user/configuring-network-mode#external',
    },
];

const features = [
    {
        emoji: '⚔',
        title: 'Arena lifecycle + warm pool',
        body: 'Arenas move through WAITING, COUNTDOWN, STARTING, LIVE and ENDING. TeaCore pastes arenas ahead of time, so players don\'t wait on a schematic paste.',
    },
    {
        emoji: '🗺',
        title: 'In-game map authoring',
        body: 'Run /tea map create, build your arena in a throwaway void world, mark spawns and save. TeaCore captures the schematic for you.',
    },
    {
        emoji: '📦',
        title: 'Kit + ability framework',
        body: 'Kits bundle items and ability bindings. You write abilities as Java classes, and TeaCore adds cooldown tracking, trigger wiring and effect bundles.',
    },
    {
        emoji: '🌐',
        title: 'Proxy-aware networking',
        body: 'Redis coordinates multi-server fleets: the queue, arena snapshots, matchmaker leader election and cross-server control commands.',
    },
    {
        emoji: '💬',
        title: 'Per-arena chat routing',
        body: 'By default, chat stays inside the arena, so match chat doesn\'t reach the lobby. Team, staff and global channels are opt-in.',
    },
    {
        emoji: '📊',
        title: 'Embedded web dashboard',
        body: 'The plugin serves one React page that lists every running arena, queue and player. You can filter, start, release and allocate arenas from the browser.',
    },
];

function Hero() {
    return (
        <header className={styles.hero}>
            <div className={styles.heroInner}>
                <h1 className={styles.heroTitle}>
                    <span className={styles.heroAccent}>Tea</span>
                </h1>
                <p className={styles.heroTagline}>
                    A reusable minigames engine for Paper (or Spigot), 1.8.8 to the latest release. Arenas, kits, queues, cross-server
                    matchmaking and a web dashboard, so your game plugin only has to handle gameplay.
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
                    TeaCore supports three arena-pool modes. Pick the one that matches how you run your servers.
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

export default function Home(): ReactNode {
    return (
        <Layout
            title="Tea: minigames engine for Paper (or Spigot)"
            description="A reusable minigames engine for Paper (or Spigot), 1.8.8 to the latest release: arenas, kits, queues, cross-server matchmaking, and a web dashboard."
        >
            <Hero />
            <main>
                <ModesSection />
                <FeaturesSection />
            </main>
        </Layout>
    );
}
