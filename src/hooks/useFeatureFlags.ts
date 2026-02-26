import { useEffect, useState } from 'react';
import { getDefaultFeatureFlags, getFeatureFlags, type FeatureFlags } from '@/services/remoteConfig';

export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<FeatureFlags>(getDefaultFeatureFlags());

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      const first = await getFeatureFlags(false);
      if (mounted) setFlags(first);
      const fresh = await getFeatureFlags(true);
      if (mounted) setFlags(fresh);
    };

    void hydrate();
    return () => {
      mounted = false;
    };
  }, []);

  return flags;
};
