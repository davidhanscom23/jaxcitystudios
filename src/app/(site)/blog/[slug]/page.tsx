import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getPost } from "@/data/blog";
import { pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return pageMeta({
    title: post.seoTitle,
    description: post.seoDescription,
    path: `/blog/${post.slug}`,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <article className="wide-margin section-space">
      <p className="font-caps text-[18px] text-muted">
        <Link href="/blog" className="no-underline">
          Journal
        </Link>{" "}
        · {post.neighborhood}
      </p>
      <h1 className="font-display crop-type mt-4 max-w-[16ch] text-[clamp(2.5rem,7vw,4.5rem)]">
        {post.title}
      </h1>
      <p className="mt-4 text-sm text-muted">{post.date}</p>

      {post.image ? (
        <div className="duotone-wrap relative mt-12 aspect-[16/9] overflow-hidden">
          <Image
            src={post.image}
            alt=""
            fill
            className="duotone object-cover"
            sizes="100vw"
            priority
          />
        </div>
      ) : (
        <div className="mt-12 flex aspect-[16/7] items-center justify-center border border-rule bg-charcoal px-8">
          <p className="font-display text-center text-5xl text-paper/25 sm:text-7xl">
            {post.neighborhood}
          </p>
        </div>
      )}

      <blockquote className="mx-auto mt-16 max-w-2xl border-l-2 border-accent pl-6 font-body text-2xl italic text-paper-dim sm:text-3xl">
        “{post.pullQuote}”
      </blockquote>

      <div className="mx-auto mt-16 max-w-2xl space-y-16">
        {post.sections.map((section, i) => (
          <section key={section.heading}>
            <div className="mb-8 flex items-center gap-4">
              <span className="font-caps text-[18px] text-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              <hr className="rule flex-1" />
            </div>
            <h2 className="font-display text-3xl">{section.heading}</h2>
            <p className="mt-5 text-lg leading-relaxed text-paper-dim">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </article>
  );
}
