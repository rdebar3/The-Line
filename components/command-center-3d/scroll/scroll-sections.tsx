"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  Award,
  Bookmark,
  Landmark,
  ScrollText,
  Shield,
  Zap,
} from "lucide-react";

import { HubHero } from "@/components/hub/hub-hero";
import { StartTrainingHubCard } from "@/components/hub/start-training-hub-card";
import { CertificationsHubCard } from "@/components/hub/certifications-hub-card";
import { MyLinesHubCard } from "@/components/hub/my-lines-hub-card";
import { QuickDrillsHubCard } from "@/components/hub/quick-drills-hub-card";
import { RepublicSimulatorHubCard } from "@/components/hub/republic-simulator-hub-card";
import { LeaderboardPanel } from "@/components/leaderboard/leaderboard-panel";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { isLeaderboardConfigured } from "@/lib/leaderboard";
import { WAR_ROOM_LABELS } from "@/lib/command-center-3d/constants";

function WarRoomPanel({
  roomIndex,
  eyebrow,
  title,
  description,
  children,
}: {
  roomIndex: number;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section
      className="flex min-h-screen w-full items-center justify-center px-4 py-20 sm:px-6"
      style={{ paddingTop: "calc(var(--site-header-height) + 2rem)" }}
      aria-label={WAR_ROOM_LABELS[roomIndex]}
    >
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.35 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="command-glass relative z-10 w-full max-w-4xl rounded-2xl p-5 sm:p-8"
      >
        <p className="font-mono text-[0.6rem] font-semibold tracking-[0.28em] text-gold uppercase sm:text-xs">
          War Room {roomIndex + 1} · {eyebrow}
        </p>
        <h2 className="hero-title-glow mt-2 font-heading text-2xl font-black tracking-wide text-foreground sm:text-3xl">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
        <div className="mt-6">{children}</div>
      </motion.div>
    </section>
  );
}

export function ScrollSections() {
  const leaderboardConfigured = isLeaderboardConfigured();

  return (
    <div className="w-full">
      <WarRoomPanel
        roomIndex={0}
        eyebrow="Command Hub"
        title="Constitutional Command Center"
        description="Tactical overview — Defender Score, daily mission, and primary training directive."
      >
        <HubHero />
        <div className="mt-6">
          <StartTrainingHubCard />
        </div>
      </WarRoomPanel>

      <WarRoomPanel
        roomIndex={1}
        eyebrow="Archives"
        title="Founding Documents Archive"
        description="Approach the floating charters — Declaration, Constitution, and Bill of Rights with full interactive study."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { href: "/declaration", label: "Declaration", icon: ScrollText },
            { href: "/constitution", label: "Constitution", icon: Landmark },
            { href: "/bill-of-rights", label: "Bill of Rights", icon: Shield },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="hub-tactical-card group flex-row items-center gap-3 p-4"
            >
              <Icon className="size-5 shrink-0 text-gold" />
              <span className="font-heading text-sm font-bold text-foreground">
                {label}
              </span>
              <ArrowRight className="ml-auto size-4 text-gold opacity-60 group-hover:opacity-100" />
            </Link>
          ))}
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/constitution" />}
          className="btn-gold btn-cta mt-4 h-11 w-full"
        >
          Enter Full Archives
        </Button>
      </WarRoomPanel>

      <WarRoomPanel
        roomIndex={2}
        eyebrow="Training Bay"
        title="Rights Under Pressure"
        description="Scenario holograms and quick drills — train under constitutional fire."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/rights-under-pressure"
            className="hub-tactical-card group border-crimson/30 p-5"
          >
            <Shield className="size-6 text-crimson-light" />
            <h3 className="mt-3 font-heading text-lg font-bold">Live Scenarios</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Grok-powered constitutional training under pressure.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold">
              Enter Training Bay <ArrowRight className="size-4" />
            </span>
          </Link>
          <QuickDrillsHubCard />
        </div>
        <Link
          href="/quick-drills"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-gold"
        >
          <Zap className="size-3.5" />
          Quick Drills command
        </Link>
      </WarRoomPanel>

      <WarRoomPanel
        roomIndex={3}
        eyebrow="Strategy"
        title="Republic Simulator"
        description="Step into the First Congress — historical decision-making with Grok counsel."
      >
        <RepublicSimulatorHubCard />
        <Link
          href="/adaptive-mission"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-constitution-blue-light hover:text-gold"
        >
          Adaptive Mission briefing <ArrowRight className="size-4" />
        </Link>
      </WarRoomPanel>

      <WarRoomPanel
        roomIndex={4}
        eyebrow="Memorial"
        title="Memorial Hall"
        description="Your saved Lines, certifications, and Defender rankings — the record of your oath."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <MyLinesHubCard />
          <CertificationsHubCard />
        </div>
        <div className="mt-4">
          <LeaderboardPanel configured={leaderboardConfigured} />
        </div>
        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Award className="size-3.5 text-gold" />
          <Bookmark className="size-3.5 text-gold" />
          <span>Progress syncs across all war rooms when signed in.</span>
        </div>
        <div className="mt-8">
          <SiteFooter variant="hub" />
        </div>
      </WarRoomPanel>
    </div>
  );
}