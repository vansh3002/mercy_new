import { Sparkle } from "../brand/Sparkle";

const STEPS = [
  { n: "01", title: "Hand-spun cotton", body: "Sourced from weavers in Lucknow, soft enough to sleep in." },
  { n: "02", title: "Artisan chikan", body: "Embroidered by hand over 4–6 days, motif by motif." },
  { n: "03", title: "Slow tailoring", body: "Cut in small runs, finished with tonal buttons and pintucks." },
  { n: "04", title: "Dispatched in 24h", body: "From our studio to your door, gift-ready, every time." },
] as const;

/** Editorial 4-step strip introducing the making process. */
export function JourneyStrip() {
  return (
    <section className="relative bg-wine-gradient text-on-accent overflow-hidden">
      <Sparkle className="absolute top-6 right-8 w-5 h-5 text-gold/70" animated />
      <Sparkle className="absolute bottom-8 left-10 w-4 h-4 text-gold/50" animated />
      <div className="container-editorial py-14 lg:py-20">
        <div className="flex flex-col items-center text-center mb-10 lg:mb-14">
          <span className="label text-gold">The Making</span>
          <h2 className="mt-3 serif text-[28px] sm:text-[34px] lg:text-[44px] leading-[1.05] text-on-accent text-balance max-w-2xl">
            Four hands, four steps, every piece.
          </h2>
        </div>

        <ol className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 lg:gap-x-8">
          {STEPS.map((s) => (
            <li key={s.n} className="flex flex-col items-start text-left">
              <span className="display italic text-[44px] lg:text-[60px] leading-none text-gold/70">
                {s.n}
              </span>
              <p className="serif text-xl lg:text-2xl text-on-accent mt-2 leading-tight">
                {s.title}
              </p>
              <p className="text-sm text-on-accent/80 mt-2 max-w-[26ch]">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
