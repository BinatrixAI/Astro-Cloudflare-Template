import { HeroUIProvider } from "@heroui/system";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar";
import { motion } from "motion/react";
import siteContent from "@/content/site.json";

export default function LandingPage() {
  const { navigation, hero, features, footer } = siteContent;

  return (
    <HeroUIProvider>
      <div className="min-h-screen bg-gradient-to-b from-background to-content1">
        {/* Navigation */}
        <Navbar maxWidth="xl" className="bg-background/60 backdrop-blur-md">
          <NavbarBrand>
            <span className="text-xl font-bold">{navigation.logo}</span>
          </NavbarBrand>
          <NavbarContent className="hidden gap-4 sm:flex" justify="center">
            {navigation.links.map((link) => (
              <NavbarItem key={link.href}>
                <a href={link.href} className="text-foreground/80 hover:text-foreground transition-colors">
                  {link.label}
                </a>
              </NavbarItem>
            ))}
          </NavbarContent>
          <NavbarContent justify="end">
            <NavbarItem>
              <Button as="a" href={navigation.cta.href} color="primary" variant="solid">
                {navigation.cta.label}
              </Button>
            </NavbarItem>
          </NavbarContent>
        </Navbar>

        {/* Hero Section */}
        <section id="home" className="py-20 md:py-32 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              {hero.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-foreground/70 mb-8"
            >
              {hero.subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button as="a" href={hero.cta.href} color="primary" size="lg" className="animate-pulse-glow">
                {hero.cta.label}
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 md:py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-16">
              {features.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.items.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="glass-card hover-lift h-full">
                    <CardBody className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-foreground/70">{feature.description}</p>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-divider">
          <div className="max-w-6xl mx-auto text-center text-foreground/60">
            {footer.copyright}
          </div>
        </footer>
      </div>
    </HeroUIProvider>
  );
}
