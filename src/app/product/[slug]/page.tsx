import { notFound } from "next/navigation";
import { productRepository } from "@/lib/data-source";
import { PdpClient } from "@/components/PdpClient";
import { RelatedRail } from "@/components/home/RelatedRail";
import { BrandMarquee } from "@/components/brand/BrandMarquee";

export async function generateStaticParams() {
  const repo = productRepository();
  const products = await repo.list();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const repo = productRepository();
  const product = await repo.bySlug(params.slug);
  if (!product) return { title: "Not found" };
  return {
    title: product.title,
    description: product.description ?? product.subtitle,
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const repo = productRepository();
  const product = await repo.bySlug(params.slug);
  if (!product) notFound();

  const all = await repo.list({ sort: "popular" });
  const sameMood = all
    .filter((p) => p.mood === product.mood && p.id !== product.id)
    .slice(0, 6);
  const completeLook = [
    ...all.filter((p) => p.collection === "festive-edit" && p.id !== product.id && p.colorHex !== product.colorHex),
    ...all.filter((p) => p.id !== product.id)
  ].filter((p, index, self) => self.findIndex(t => t.id === p.id) === index)
   .slice(0, 10);
  const youMayAlso = all
    .filter((p) => p.id !== product.id && !sameMood.includes(p))
    .slice(0, 6);

  return (
    <article className="container-editorial py-6 lg:py-12">
      <PdpClient product={product} relatedProducts={completeLook} />
    </article>
  );
}
