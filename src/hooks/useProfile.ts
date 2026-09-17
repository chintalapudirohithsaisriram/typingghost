import { useCallback, useEffect, useState } from "react";
import {
  defaultProfile,
  loadProfile,
  resetProfile,
  saveProfile,
  type ProfileState,
} from "@/lib/profile";

/**
 * Progress lives in the browser, so it is read after hydration to keep
 * server and client markup identical.
 */
export function useProfile() {
  const [profile, setProfile] = useState<ProfileState>(defaultProfile);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
    setReady(true);
  }, []);

  const update = useCallback((updater: (current: ProfileState) => ProfileState) => {
    setProfile((current) => {
      const next = updater(current);
      saveProfile(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    resetProfile();
    setProfile(defaultProfile());
  }, []);

  return { profile, ready, update, clear };
}
