import { Fingerprint, KeyRound, ShieldCheck, Sparkles } from 'lucide-react';
import { Card, InfoCard, LearnCard, PageHeader } from '../components/index.ts';
import { LEARN_TOPICS } from '../data/demo.ts';

export function Learn() {
  const mainTopic = LEARN_TOPICS.find(topic => topic.available)!;
  const futureTopics = LEARN_TOPICS.filter(topic => !topic.available);
  return (
    <>
      <PageHeader title="Learn" subtitle="Optional detail so education does not interrupt normal use." />
      <LearnCard title={mainTopic.title} description={mainTopic.description}>
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
            return <div className="future-topic" key={topic.id}><span className="topic-icon"><Icon size={19} aria-hidden="true" /></span><h3>{topic.title}</h3><span className="soon-pill">Soon</span></div>;
          })}
        </Card>
      </section>
      <p className="learn-footnote"><Sparkles size={15} aria-hidden="true" /> Small steps. Safer everyday habits.</p>
    </>
  );
}
