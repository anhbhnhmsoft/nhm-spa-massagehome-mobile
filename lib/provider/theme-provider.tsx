import { ReactNode } from 'react';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider as ReactNavigationThemeProvider } from '@react-navigation/native';

const ThemeProvider = ({ children }: { children: ReactNode }) => {

  return (
    <ReactNavigationThemeProvider value={NAV_THEME['light']}>
      {children}
    </ReactNavigationThemeProvider>
    )
}

export default ThemeProvider;