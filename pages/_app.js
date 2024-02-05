import "@/styles/globals.css";
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
	  	<ThemeProvider>
        <Component {...pageProps} />
  		</ThemeProvider>
    </AuthProvider>
  );
}

