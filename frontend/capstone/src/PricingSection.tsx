"use client";

import { CardSpotlight } from "@/ui/card-spotlight";

export default function PricingSection() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Pricing</h1>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Start learning for free. Upgrade only when you're ready to unlock
            advanced features, unlimited access, and deeper learning analytics.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Developer (Free) Card */}
          <CardSpotlight
            className="h-auto rounded-2xl border border-neutral-800 bg-black p-8"
            color="rgba(59, 130, 246, 0.3)"
          >
            <div className="relative z-20">
              <h3 className="text-2xl font-bold text-white mb-2">Developer</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-neutral-400 ml-2">/month</span>
              </div>
              <p className="text-neutral-400 text-sm mb-8">Free</p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <div>
                    <div className="text-neutral-200 font-medium">
                      Analysis Cost
                    </div>
                    <div className="text-neutral-400 text-sm">$0 / Month</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <div>
                    <div className="text-neutral-200 font-medium">
                      Repository Limit
                    </div>
                    <div className="text-neutral-400 text-sm">
                      1 Active Project
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <div>
                    <div className="text-neutral-200 font-medium">
                      Code Depth
                    </div>
                    <div className="text-neutral-400 text-sm">Summary Only</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <div>
                    <div className="text-neutral-200 font-medium">
                      Agent Access
                    </div>
                    <div className="text-neutral-400 text-sm">Scala Agent</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <div>
                    <div className="text-neutral-200 font-medium">Support</div>
                    <div className="text-neutral-400 text-sm">Community</div>
                  </div>
                </li>
              </ul>

              {/* Button */}
              <button className="w-full bg-neutral-100 text-black py-3 rounded-lg font-semibold hover:bg-white transition">
                Get Started Free
              </button>
            </div>
          </CardSpotlight>

          {/* Professional Plan Card */}
          <CardSpotlight
            className="h-auto rounded-2xl border border-neutral-800 bg-black p-8 relative"
            color="rgba(139, 92, 246, 0.3)"
          >
            {/* Most Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-black border border-neutral-700 px-4 py-1 rounded-full text-xs font-semibold text-white">
              Most Popular
            </div>

            <div className="relative z-20">
              <h3 className="text-2xl font-bold text-white mb-2">
                Professional
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$5</span>
                <span className="text-neutral-400 ml-2">/month</span>
              </div>
              <p className="text-neutral-400 text-sm mb-8">
                For growing teams and projects
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <div>
                    <div className="text-neutral-200 font-medium">
                      Analysis Cost
                    </div>
                    <div className="text-neutral-400 text-sm">$5 / Month</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <div>
                    <div className="text-neutral-200 font-medium">
                      Repository Limit
                    </div>
                    <div className="text-neutral-400 text-sm">
                      10 Active Projects
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <div>
                    <div className="text-neutral-200 font-medium">
                      Code Depth
                    </div>
                    <div className="text-neutral-400 text-sm">
                      Full AST Evidence
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <div>
                    <div className="text-neutral-200 font-medium">
                      Agent Access
                    </div>
                    <div className="text-neutral-400 text-sm">
                      All Agents (Scala, PySpark, Hive)
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <div>
                    <div className="text-neutral-200 font-medium">Support</div>
                    <div className="text-neutral-400 text-sm">Email</div>
                  </div>
                </li>
              </ul>

              {/* Button */}
              <button className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-neutral-100 transition">
                Upgrade to Pro
              </button>
            </div>
          </CardSpotlight>

          {/* Enterprise Plan Card */}
          <CardSpotlight
            className="h-auto rounded-2xl border border-neutral-800 bg-black p-8"
            color="rgba(236, 72, 153, 0.3)"
          >
            <div className="relative z-20">
              <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$49</span>
                <span className="text-neutral-400 ml-2">/month</span>
              </div>
              <p className="text-neutral-400 text-sm mb-8">
                For large-scale operations
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <div>
                    <div className="text-neutral-200 font-medium">
                      Analysis Cost
                    </div>
                    <div className="text-neutral-400 text-sm">$49 / Month</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <div>
                    <div className="text-neutral-200 font-medium">
                      Repository Limit
                    </div>
                    <div className="text-neutral-400 text-sm">Unlimited</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <div>
                    <div className="text-neutral-200 font-medium">
                      Code Depth
                    </div>
                    <div className="text-neutral-400 text-sm">
                      Full AST + Global Context
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <div>
                    <div className="text-neutral-200 font-medium">
                      Agent Access
                    </div>
                    <div className="text-neutral-400 text-sm">
                      Multi-Agent Orchestration
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <div>
                    <div className="text-neutral-200 font-medium">Support</div>
                    <div className="text-neutral-400 text-sm">
                      24/7 Priority
                    </div>
                  </div>
                </li>
              </ul>

              {/* Button */}
              <button className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-neutral-100 transition">
                Contact Sales
              </button>
            </div>
          </CardSpotlight>
        </div>
      </div>
    </div>
  );
}

const CheckIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5 text-blue-500 shrink-0"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path
        d="M12 2c-.218 0 -.432 .002 -.642 .005l-.616 .017l-.299 .013l-.579 .034l-.553 .046c-4.785 .464 -6.732 2.411 -7.196 7.196l-.046 .553l-.034 .579c-.005 .098 -.01 .198 -.013 .299l-.017 .616l-.004 .318l-.001 .324c0 .218 .002 .432 .005 .642l.017 .616l.013 .299l.034 .579l.046 .553c.464 4.785 2.411 6.732 7.196 7.196l.553 .046l.579 .034c.098 .005 .198 .01 .299 .013l.616 .017l.642 .005l.642 -.005l.616 -.017l.299 -.013l.579 -.034l.553 -.046c4.785 -.464 6.732 -2.411 7.196 -7.196l.046 -.553l.034 -.579c.005 -.098 .01 -.198 .013 -.299l.017 -.616l.005 -.642l-.005 -.642l-.017 -.616l-.013 -.299l-.034 -.579l-.046 -.553c-.464 -4.785 -2.411 -6.732 -7.196 -7.196l-.553 -.046l-.579 -.034a28.058 28.058 0 0 0 -.299 -.013l-.616 -.017l-.318 -.004l-.324 -.001zm2.293 7.293a1 1 0 0 1 1.497 1.32l-.083 .094l-4 4a1 1 0 0 1 -1.32 .083l-.094 -.083l-2 -2a1 1 0 0 1 1.32 -1.497l.094 .083l1.293 1.292l3.293 -3.292z"
        fill="currentColor"
        strokeWidth="0"
      />
    </svg>
  );
};
