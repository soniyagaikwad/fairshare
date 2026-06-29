import { Link, useParams } from 'react-router-dom';
import { useApp, getGroup, getExpense } from '../context/AppContext';
import ExpenseForm from '../components/ExpenseForm';

export default function EditExpense() {
  const { groupId, expenseId } = useParams();
  const { state } = useApp();
  const group = getGroup(state, groupId);
  const expense = getExpense(state, expenseId);

  if (!group || !expense) {
    return (
      <div className="empty-state">
        <p>Expense not found.</p>
        <Link to={`/groups/${groupId}`} className="btn btn--primary">Back to Group</Link>
      </div>
    );
  }

  if (group.archived) {
    return (
      <div className="empty-state">
        <p>Archived groups are read-only.</p>
        <Link to={`/groups/${groupId}`} className="btn btn--primary">View Group</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to={`/groups/${groupId}`} className="back-link">← Back to {group.name}</Link>
      <div className="page-header">
        <h1 className="page-header__title">Edit Expense</h1>
        <p className="page-header__subtitle">{expense.description}</p>
      </div>
      <div className="receipt receipt--torn-top">
        <div className="receipt__body">
          <ExpenseForm group={group} groupId={groupId} expense={expense} />
        </div>
      </div>
    </div>
  );
}
