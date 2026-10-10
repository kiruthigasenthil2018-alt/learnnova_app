import { useWindowDimensions } from 'react-native';

// One place for every breakpoint decision (mobile < 600 <= tablet < 1024 <= desktop)
export default function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 600, isTablet = width >= 600 && width < 1024, isDesktop = width >= 1024;
  return {
    width, height, isMobile, isTablet, isDesktop,
    maxCols: isMobile ? 1 : isTablet ? 2 : 3,       // card columns
    maxW: isDesktop ? 1040 : isTablet ? 820 : 640,  // comfortable content width
    pad: isMobile ? 14 : isTablet ? 20 : 28,
    fs: (n) => Math.round(n * (isMobile ? 1 : isTablet ? 1.08 : 1.15)), // scaled font size
  };
}
