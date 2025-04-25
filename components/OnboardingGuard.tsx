import { useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { useOnboarding } from "../contexts/OnboardingContext";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const router = useRouter();
  const { hasCompletedOnboarding } = useOnboarding();

  useEffect(() => {
    const inOnboardingGroup = segments[0] === "onboarding";

    if (!hasCompletedOnboarding && !inOnboardingGroup) {
      router.replace("/(onboarding)" as any);
    } else if (hasCompletedOnboarding && inOnboardingGroup) {
      router.replace("/(app)" as any);
    }
  }, [hasCompletedOnboarding, segments]);

  return <>{children}</>;
}
