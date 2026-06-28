import Link from "next/link";
import { WomaniyaWordmark } from "@/components/brand/WomaniyaWordmark";
import { OrnateDivider } from "@/components/brand/OrnateDivider";
import { Sparkle } from "@/components/brand/Sparkle";

export default function NotFound() {
  return (
    <div className="container-boutique py-20 lg:py-32 flex flex-col items-center text-center gap-4 relative">
      <Sparkle className="absolute top-12 right-8 w-4 h-4 text-gold/60" animated />
      <Sparkle className="absolute bottom-16 left-10 w-3 h-3 text-gold/50" animated />
      <WomaniyaWordmark variant="stacked" tagline={false} showArch />
      <OrnateDivider width="md" className="my-4" />
      <span className="label text-wine/80">404 ,Page not found</span>
      <h1 className="serif text-4xl lg:text-5xl text-ink text-balance max-w-xl">
        This page took the day off.
      </h1>
      <p className="text-sm text-ink-dim max-w-md text-pretty">
        It may have moved, or never existed at all. The Festive Edit is always a
        good place to begin again.
      </p>
      <div className="flex gap-3 mt-3 justify-center">
        <Link href="/explore" className="btn-wine">
          Explore Collection
        </Link>
      </div>
    </div>
  );
}
