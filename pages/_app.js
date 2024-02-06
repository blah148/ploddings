// Import your dependencies
import "@/styles/globals.css";
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

// This is a new component that consumes the useTheme hook
const ThemedAppContent = ({ Component, pageProps }) => {
  const { theme } = useTheme();

  return (
    <div className={`ploddings ${theme}`}>
      <Component {...pageProps} />
    </div>
  );
};

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        {/* Use the ThemedAppContent component to wrap your page content */}
        <ThemedAppContent Component={Component} pageProps={pageProps} />
      </ThemeProvider>
    </AuthProvider>
  );
}

