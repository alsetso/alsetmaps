import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export interface DocumentPageProps {
  emoji?: string;
  title: string;
  tagline?: string;
  description: string;
  keywords?: string[];
  lastUpdated?: string;
  readTime?: string;
}

export function DocumentPage({
  emoji,
  title,
  tagline,
  description,
  keywords = [],
  lastUpdated,
  readTime
}: DocumentPageProps) {
  return (
    <article className="prose w-full">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          {emoji && (
            <span className="text-4xl" role="img" aria-label="Page icon">
              {emoji}
            </span>
          )}
          <h1 className="mb-0">{title}</h1>
        </div>
        
        {tagline && (
          <p className="tagline">{tagline}</p>
        )}

        {(lastUpdated || readTime) && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            {lastUpdated && <span>Updated {lastUpdated}</span>}
            {readTime && <span>{readTime} read</span>}
          </div>
        )}
      </header>

      <Separator className="mb-8" />

      {/* Content */}
      <section className="mb-8">
        <h2>Overview</h2>
        <div className="description">
          {description.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </section>

      {/* Keywords Section */}
      {keywords.length > 0 && (
        <>
          <Separator className="mb-8" />
          <section>
            <h2>Related Topics</h2>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                SEO Keywords & Related Terms
              </h3>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs"
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </Card>
          </section>
        </>
      )}
    </article>
  );
}