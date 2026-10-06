import { ChevronRight, Fingerprint, KeyRound, ShieldCheck, Sparkles } from 'lucide-react';
import { Card, InfoCard, LearnCard, PageHeader } from '../components/index.ts';
import { LEARN_TOPICS } from '../data/demo.ts';
import type { Route } from '../routes.ts';

export function Learn({ navigate }: { navigate: (route: Route) => void }) {
  const mainTopic = LEARN_TOPICS.find(topic => topic.available)!;
  const futureTopics = LEARN_TOPICS.filter(topic => !topic.available);
  return (
    <>
      <PageHeader title="Learn" subtitle="Optional detail so education does not interrupt normal use." />
      <LearnCard title={mainTopic.title} description={mainTopic.description}
        onClick={() => navigate({ screen: 'learn-article', articleId: mainTopic.id })}>
        <div className="learning-note"><ShieldCheck size={18} aria-hidden="true" /><span>One account. One password.</span></div>
      </LearnCard>
      <InfoCard title="Example">
        <p>{mainTopic.example}</p>
      </InfoCard>
      <section className="learn-next" aria-labelledby="learn-next-heading">
        <div className="section-heading"><h2 id="learn-next-heading">A little more, when you need it</h2></div>
        <Card className="future-topics">
          {futureTopics.map(topic => {
            const Icon = topic.id === 'two-factor' ? KeyRound : Fingerprint;
            return (
              <button type="button" className="future-topic learn-topic-button" key={topic.id}
                onClick={() => navigate({ screen: 'learn-article', articleId: topic.id })}>
                <span className="topic-icon"><Icon size={19} aria-hidden="true" /></span>
                <span className="topic-title">{topic.title}</span>
                <ChevronRight size={17} aria-hidden="true" />
              </button>
            );
          })}
        </Card>
      </section>
      <p className="learn-footnote"><Sparkles size={15} aria-hidden="true" /> Small steps. Safer everyday habits.</p>
    </>
  );
}
