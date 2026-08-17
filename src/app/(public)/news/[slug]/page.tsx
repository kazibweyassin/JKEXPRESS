import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/safe-query";
import { formatDate } from "@/lib/utils";

const FALLBACK_COVER = "/site-photos/site-01.jpeg";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await safeQuery(
    () => db.newsArticle.findUnique({ where: { slug } }),
    null,
  );
  return {
    title: article?.title ?? "Article",
    description: article?.excerpt ?? undefined,
  };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await safeQuery(
    () =>
      db.newsArticle.findFirst({
        where: { slug, isPublished: true },
      }),
    null,
  );
  if (!article) notFound();

  const related = await safeQuery(
    () =>
      db.newsArticle.findMany({
        where: { isPublished: true, NOT: { id: article.id } },
        orderBy: { publishedAt: "desc" },
        take: 3,
      }),
    [],
  );

  const paragraphs = article.content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div>
      <section className="border-b border-slate-200 bg-navy-950 text-white">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Link
            href="/news"
            className="inline-flex items-center gap-1 text-sm text-slate-300 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> All news
          </Link>
          <Badge variant="gold" className="mt-5">
            Insight
          </Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {article.title}
          </h1>
          <p className="mt-4 flex items-center gap-2 text-sm text-slate-300">
            <CalendarDays className="h-4 w-4 text-gold-400" />
            {formatDate(article.publishedAt)}
          </p>
          {article.excerpt ? (
            <p className="mt-4 text-lg text-slate-300">{article.excerpt}</p>
          ) : null}
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-2xl bg-slate-200">
          <Image
            src={article.coverImage || FALLBACK_COVER}
            alt={article.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>

        <div className="space-y-5 text-base leading-relaxed text-slate-700">
          {paragraphs.map((para, i) => (
            <p key={i} className="whitespace-pre-wrap">
              {para}
            </p>
          ))}
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl bg-navy-900 px-6 py-8 text-white sm:px-8">
          <div className="brand-red-bar mb-4 h-1 w-16 rounded-full" />
          <h2 className="text-xl font-bold">Talk to JK Express</h2>
          <p className="mt-2 text-sm text-slate-300">
            Building, buying or managing property in Uganda? Our team can help
            with the next step.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="gold" asChild>
              <Link href="/request-quote">Request a quote</Link>
            </Button>
            <Button
              variant="outline"
              className="border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href="/contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </article>

      {related.length > 0 ? (
        <section className="border-t border-slate-200 bg-slate-50 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-navy-900">More insights</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.slug}`}
                  className="group block text-inherit no-underline"
                >
                  <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-200">
                      <Image
                        src={item.coverImage || FALLBACK_COVER}
                        alt={item.title}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-5">
                      <p className="text-xs text-slate-400">
                        {formatDate(item.publishedAt)}
                      </p>
                      <h3 className="font-semibold text-navy-900 line-clamp-2">
                        {item.title}
                      </h3>
                      <span className="inline-flex items-center gap-1 pt-1 text-sm font-semibold text-gold-500">
                        Read more <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
