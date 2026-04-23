import { useEffect, useState } from 'react';
import { getDefaultFeatureFlags, getFeatureFlags, type FeatureFlags } from '@/services/remoteConfig';

export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<FeatureFlags>(getDefaultFeatureFlags());

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      try {
        const first = await getFeatureFlags(false);
        if (mounted) setFlags(first);
        const fresh = await getFeatureFlags(true);
        if (mounted) setFlags(fresh);
      } catch (error) {
        // Never fail app startup if remote flags or cache read has issues.
        console.error('Feature flag hydration failed:', error);
        if (mounted) {
          setFlags(getDefaultFeatureFlags());
        }
      }
    };

    void hydrate();
    return () => {
      mounted = false;
    };
  }, []);

  return flags;
};
