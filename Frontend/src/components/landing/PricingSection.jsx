import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button, Badge, Card } from '@/components/ui';

export const PricingSection = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for small teams',
      features: [
        'Up to 5 team members',
        '3 projects',
        'Basic features',
        '5GB storage',
        'Community support',
      ],
      cta: 'Start Free',
      variant: 'secondary',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$12',
      period: 'per user/month',
      description: 'For growing teams',
      features: [
        'Unlimited members',
        'Unlimited projects',
        'Advanced features',
        '100GB storage',
        'Priority support',
        'Custom integrations',
        'Advanced analytics',
      ],
      cta: 'Start Free Trial',
      variant: 'primary',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      description: 'For large organizations',
      features: [
        'Everything in Pro',
        'Advanced security',
        'SSO & SAML',
        'Dedicated support',
        'Custom contracts',
        'Onboarding assistance',
        'SLA guarantee',
      ],
      cta: 'Contact Sales',
      variant: 'secondary',
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Choose the perfect plan for your team's needs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -8, scale: plan.popular ? 1.05 : 1.02 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <Badge variant="primary" className="px-4 py-1 shadow-lg">
                    MOST POPULAR
                  </Badge>
                </div>
              )}

              <Card
                className={`h-full p-8 relative overflow-hidden ${
                  plan.popular
                    ? 'border-2 border-indigo-600 shadow-2xl shadow-indigo-500/20'
                    : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />
                )}

                <div className="relative">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-slate-600 text-sm mb-4">
                      {plan.description}
                    </p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-bold gradient-text">
                        {plan.price}
                      </span>
                      <span className="text-slate-500 text-sm">
                        /{plan.period}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 + i * 0.05 }}
                        className="flex items-center gap-3"
                      >
                        <svg
                          className="w-5 h-5 text-emerald-500 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-slate-700">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link to="/register" className="block">
                    <Button
                      variant={plan.variant}
                      size="lg"
                      className="w-full"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust Message */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-slate-500 mt-12"
        >
          All plans include a <span className="font-semibold text-slate-700">14-day free trial</span>.
          No credit card required.
        </motion.p>
      </div>
    </section>
  );
};
