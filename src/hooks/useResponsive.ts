/**
 * Responsive dimension hook.
 * Uses React Native's useWindowDimensions for live updates on
 * orientation change, split-screen, or window resize (web).
 */
import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const cardWidth = (width - 52) / 2;
  const isTablet = width >= 768;
  const isLandscape = width > height;

  // Adaptive column count for grids
  const gridColumns = isTablet ? (isLandscape ? 4 : 3) : 2;
  const gridCardWidth = (width - 16 * (gridColumns + 1)) / gridColumns;

  return {
    width,
    height,
    cardWidth,
    isTablet,
    isLandscape,
    gridColumns,
    gridCardWidth,
  };
}
