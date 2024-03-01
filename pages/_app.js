// Import your dependencies
import "@/styles/globals.css";
import { LoadingProvider } from '../context/LoadingContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import Head from 'next/head';

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
    <LoadingProvider>
      <ThemeProvider>
      <Head>
        <link rel="icon" href="/favicon.png" />
      </Head>
        <ThemedAppContent Component={Component} pageProps={pageProps} />
      </ThemeProvider>
    </LoadingProvider>
  );
}

