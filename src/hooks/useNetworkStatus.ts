import { useEffect, useState } from 'react';
import * as Network from 'expo-network';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        if (!mounted) return;
        setIsOnline(Boolean(state.isConnected) && state.isInternetReachable !== false);
      } catch {
        if (!mounted) return;
        setIsOnline(true);
      }
    };

    void hydrate();

    const subscription = Network.addNetworkStateListener((state) => {
      setIsOnline(Boolean(state.isConnected) && state.isInternetReachable !== false);
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return isOnline;
};
