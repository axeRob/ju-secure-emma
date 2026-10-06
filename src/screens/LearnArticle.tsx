import { Card, InfoCard, PageHeader, PrimaryButton } from '../components/index.ts';
import { LEARN_ARTICLES } from '../data/articles.ts';
import type { Route } from '../routes.ts';

export function LearnArticle({ articleId, navigate }: { articleId: string; navigate: (route: Route) => void }) {
  const article = Object.hasOwn(LEARN_ARTICLES, articleId) ? LEARN_ARTICLES[articleId] : undefined;
  const backToLearn = () => navigate({ screen: 'learn' });

  if (!article) {
    return (
      <>
        <PageHeader title="Learn" onBack={backToLearn} />
        <div className="screen-stack">
          <InfoCard title="Choose a topic"><p>Find simple explanations in Learn.</p></InfoCard>
          <PrimaryButton onClick={backToLearn}>Back to Learn</PrimaryButton>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title={article.title} subtitle="A little detail, only when you want it." onBack={backToLearn} />
      <div className="screen-stack">
        <Card className="article-content"><p>{article.introduction}</p></Card>
        <InfoCard title="Example"><p>{article.example}</p></InfoCard>
        <Card className="article-content">
          <h2 className="article-heading">Why it helps</h2>
          <p>{article.benefit}</p>
        </Card>
        <PrimaryButton onClick={backToLearn}>Back to Learn</PrimaryButton>
      </div>
    </>
  );
}
