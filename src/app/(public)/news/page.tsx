import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "News & Insights",
  description:
    "Market updates, construction insights and property management guidance from JK Express.",
};

const FALLBACK_COVER = "/site-photos/site-01.jpeg";

export default async function NewsPage() {
  let articles: Awaited<ReturnType<typeof db.newsArticle.findMany>> = [];
  try {
    articles = await db.newsArticle.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    articles = [];
  }

  const [featured, ...rest] = articles;

  return (
    <div>
      <section className="border-b border-slate-200 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <Badge variant="gold" className="mb-4">
            Insights
          </Badge>
          <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            News & insights
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Market notes, site standards and practical guidance from the JK
            Express team — construction, real estate and property management.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {featured ? (
          <Link
            href={`/news/${featured.slug}`}
            className="group grid overflow-hidden rounded-2xl border border-slate-200 bg-white text-inherit no-underline shadow-sm transition hover:shadow-md lg:grid-cols-2"
          >
            <div className="relative aspect-[16/10] min-h-[240px] lg:aspect-auto lg:min-h-[340px]">
              <Image
                src={featured.coverImage || FALLBACK_COVER}
                alt={featured.title}
                fill
                priority
                className="object-cover transition duration-500 group-hover:scale-[1.02]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                Featured · {formatDate(featured.publishedAt)}
              </p>
              <h2 className="mt-3 text-2xl font-bold text-navy-900 sm:text-3xl">
                {featured.title}
              </h2>
              {featured.excerpt ? (
                <p className="mt-3 text-slate-600 leading-relaxed">
                  {featured.excerpt}
                </p>
              ) : null}
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-gold-500">
                Read article <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        ) : null}

        {rest.length > 0 ? (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-navy-900">Latest articles</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((article) => (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className="group block text-inherit no-underline"
                >
                  <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md hover:ring-1 hover:ring-gold-500/20">
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-200">
                      <Image
                        src={article.coverImage || FALLBACK_COVER}
                        alt={article.title}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-5">
                      <p className="text-xs text-slate-400">
                        {formatDate(article.publishedAt)}
                      </p>
                      <h3 className="font-semibold text-navy-900 line-clamp-2">
                        {article.title}
                      </h3>
                      {article.excerpt ? (
                        <p className="flex-1 text-sm text-slate-600 line-clamp-3">
                          {article.excerpt}
                        </p>
                      ) : null}
                      <span className="inline-flex items-center gap-1 pt-1 text-sm font-semibold text-gold-500">
                        Read more <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {articles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
            <Newspaper className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-3 text-slate-500">No articles published yet.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
