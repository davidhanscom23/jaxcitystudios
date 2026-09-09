import Image from "next/image";
import Link from "next/link";
import { BLOG_POSTS } from "@/data/blog";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Journal | Recording & Podcast Notes for Jacksonville Neighborhoods",
  description:
    "Magazine-style notes from JaxCity Studios for Riverside, Avondale, San Marco, Jacksonville Beach, and Ponte Vedra — rates, rooms, and session craft.",
  path: "/blog",
});

export default function BlogIndex() {
  const featured = BLOG_POSTS.filter((p) => p.featured);
  const rest = BLOG_POSTS.filter((p) => !p.featured);

  return (
    <div className="wide-margin section-space">
      <p className="font-caps text-[18px] text-muted">Journal</p>
      <h1 className="font-display crop-type mt-4 text-[clamp(3rem,9vw,6rem)]">
        Neighborhood notes
      </h1>
      <p className="mt-6 max-w-xl text-paper-dim">
        Eight pieces. Riverside & Avondale, San Marco, Jacksonville Beach, Ponte
        Vedra — two each. Rates cited from the published card.
      </p>

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        {featured.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group no-underline"
          >
            <div className="duotone-wrap relative aspect-[16/10] overflow-hidden">
              {post.image && (
                <Image
                  src={post.image}
                  alt=""
                  fill
                  className="duotone object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              )}
            </div>
            <p className="font-caps mt-5 text-[18px] text-muted">
              {post.neighborhood} · {post.date}
            </p>
            <h2 className="font-display mt-3 text-3xl leading-none group-hover:text-paper-dim">
              {post.title}
            </h2>
            <p className="mt-3 text-paper-dim">{post.excerpt}</p>
          </Link>
        ))}
      </div>

      <div className="mt-20 grid gap-10 border-t border-rule pt-16 md:grid-cols-2">
        {rest.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="border-t border-rule pt-8 no-underline"
          >
            <div className="flex aspect-[16/7] items-end bg-graphite p-6">
              <p className="font-display text-4xl leading-none text-paper/20">
                {post.neighborhood.split(" ")[0]}
              </p>
            </div>
            <p className="font-caps mt-5 text-[18px] text-muted">
              {post.neighborhood} · {post.date}
            </p>
            <h2 className="font-display mt-3 text-2xl">{post.title}</h2>
            <p className="mt-2 text-sm text-muted">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
