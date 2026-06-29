import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import CreateGroup from './pages/CreateGroup';
import GroupDetail from './pages/GroupDetail';
import AddExpense from './pages/AddExpense';
import SettleUp from './pages/SettleUp';
import './App.css';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/groups/new" element={<CreateGroup />} />
            <Route path="/groups/:groupId" element={<GroupDetail />} />
            <Route path="/groups/:groupId/expenses/new" element={<AddExpense />} />
            <Route path="/groups/:groupId/settle" element={<SettleUp />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}
