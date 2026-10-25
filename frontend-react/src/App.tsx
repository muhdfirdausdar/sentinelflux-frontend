import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';
import ErrorBoundary from './components/common/ErrorBoundary';
import Home from './pages/Home/Home';
import AboutUs from './pages/AboutUs/AboutUs';
import AboutFastflux from './pages/AboutFastflux/AboutFastflux';
import SearchDomain from './pages/SearchDomain/SearchDomain';
import LiveMap from './pages/Visualization/LiveMap';
import Top10 from './pages/Visualization/Top10';
import AutoDNSDig from './pages/Tools/AutoDNSDig';
import FastFluxLookup from './pages/Tools/FastFluxLookup';
import DomainDetails from './pages/DomainDetails/DomainDetails';
import { ROUTES } from './constants';
import './assets/App.css';
import Layout from './components/Layout/Layout';
import { ThemeProvider } from "@/components/theme-provider"
import tokenService from './services/tokenService';
import { API_BASE_URL } from './constants';
// Create Apollo Client directly here
const httpLink = new HttpLink({
  uri: `${API_BASE_URL}/graphql`,
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

function App() {
  useEffect(() => {
    if (!tokenService.hasValidToken()) {
      tokenService.fetchToken().catch(console.error);
    }
  }, []);

  return (
    <ErrorBoundary>
      <ApolloProvider client={client}>
        <Router>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <Layout>
              <Routes>
                <Route path={ROUTES.HOME} element={<Home />} />
                <Route path={ROUTES.ABOUT_US} element={<AboutUs />} />
                <Route path={ROUTES.ABOUT_FASTFLUX} element={<AboutFastflux />} />
                <Route path={ROUTES.SEARCH_DOMAIN} element={<SearchDomain />} />
                <Route path={ROUTES.LIVEMAP} element={<LiveMap />} />
                <Route path={ROUTES.TOP10} element={<Top10 />} />
                <Route path={ROUTES.AUTODNSDIG} element={<AutoDNSDig />} />
                <Route path={ROUTES.FASTFLUXLOOKUP} element={<FastFluxLookup />} />
                <Route path={ROUTES.DOMAIN_DETAILS} element={<DomainDetails />} />
              </Routes>
            </Layout>
          </ThemeProvider>
        </Router>
      </ApolloProvider>
    </ErrorBoundary>
  );
}

export default App;