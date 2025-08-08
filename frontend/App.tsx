import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import AuditList from "./pages/AuditList";
import AuditForm from "./pages/AuditForm";
import AuditDetail from "./pages/AuditDetail";
import Auditors from "./pages/Auditors";
import Analytics from "./pages/Analytics";
import ImportData from "./pages/ImportData";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppInner() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/audits" element={<AuditList />} />
          <Route path="/audits/new" element={<AuditForm />} />
          <Route path="/audits/:id" element={<AuditDetail />} />
          <Route path="/audits/:id/edit" element={<AuditForm />} />
          <Route path="/auditors" element={<Auditors />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/import" element={<ImportData />} />
        </Routes>
      </Layout>
      <Toaster />
    </Router>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
