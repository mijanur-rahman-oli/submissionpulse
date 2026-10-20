import { CheckCircle2, SearchCheck, Upload } from "lucide-react"

const STEPS = [
  {
    n: "01",
    Icon: Upload,
    title: "Submit Your Project",
    description:
      "Provide your repository link, live URL, and a brief description of your technical stack.",
  },
  {
    n: "02",
    Icon: SearchCheck,
    title: "Mentor Review",
    description:
      "Expert mentors evaluate your code, design, and architecture for industry standards.",
  },
  {
    n: "03",
    Icon: CheckCircle2,
    title: "Get Approved",
    description:
      "Receive actionable feedback and official approval to add to your portfolio.",
  },
] as const

export function HowItWorks() {
  return (
    <section className="bg-gray-50/50 py-24">
      <div className="mx-auto max-w-6xl px-4">
        <header className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold tracking-wide text-purple-600 uppercase">
            How It Works
          </span>
          <h2 className="mt-2 mb-4 text-3xl font-bold md:text-4xl">
            Three steps to showcase your work
          </h2>
          <p className="text-lg text-gray-500">
            Submit your code, get expert feedback, and earn your approval.
          </p>
        </header>

        <div className="relative isolate mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
          {/* Subtle dashed connector behind the icons on desktop.
             Spans full width but sits at the icon row's vertical center (top-14
             matches the 56px-tall icon container center, approx). Only shown
             on md+ where the columns are actually side-by-side. */}
          <div
            aria-hidden
            className="absolute top-14 right-0 left-0 z-0 hidden h-px border-t border-dashed border-gray-300 md:block"
          />

          {STEPS.map((s) => {
            const Icon = s.Icon
            return (
              <div
                key={s.n}
                className="relative flex flex-col items-center p-6 text-center"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 shadow-sm">
                  <Icon className="h-8 w-8" strokeWidth={1.75} />
                </div>
                <span className="mb-2 text-sm font-bold tracking-wider text-purple-600/50 uppercase">
                  STEP {s.n}
                </span>
                <h3 className="mb-3 text-xl font-semibold">{s.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  {s.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
