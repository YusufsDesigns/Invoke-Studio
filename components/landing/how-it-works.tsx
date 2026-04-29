import { PenLine, CreditCard, DollarSign } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: PenLine,
    title: "Create a Tool",
    description:
      "Write a system prompt, define the input form, set your price. Publish in minutes. No technical setup required.",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    number: "02",
    icon: CreditCard,
    title: "Buyers Run It",
    description:
      "Humans and AI agents fill the form, pay once in USDC, get results instantly. No account required to buy.",
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
  },
  {
    number: "03",
    icon: DollarSign,
    title: "You Get Paid",
    description:
      "Earnings accumulate in your dashboard. Withdraw to your email anytime — Locus sends USDC via email claim link.",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-600 mb-3">
            How it works
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900">
            Simple by Design
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-gray-50 rounded-2xl p-7 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-6">
                <span className="text-5xl font-black tracking-tighter text-gray-200 leading-none select-none">
                  {step.number}
                </span>
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${step.iconBg}`}>
                  <step.icon className={`w-5 h-5 ${step.iconColor}`} />
                </div>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
