import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Groups from './pages/Groups';
import CreateGroup from './pages/CreateGroup';
import EditGroup from './pages/EditGroup';
import GroupDetail from './pages/GroupDetail';
import AddExpense from './pages/AddExpense';
import EditExpense from './pages/EditExpense';
import AddRecurring from './pages/AddRecurring';
import SettleUp from './pages/SettleUp';
import Search from './pages/Search';
import Reports from './pages/Reports';
import './App.css';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/search" element={<Search />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/groups/new" element={<CreateGroup />} />
            <Route path="/groups/:groupId" element={<GroupDetail />} />
            <Route path="/groups/:groupId/edit" element={<EditGroup />} />
            <Route path="/groups/:groupId/expenses/new" element={<AddExpense />} />
            <Route path="/groups/:groupId/expenses/:expenseId/edit" element={<EditExpense />} />
            <Route path="/groups/:groupId/recurring/new" element={<AddRecurring />} />
            <Route path="/groups/:groupId/settle" element={<SettleUp />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}
