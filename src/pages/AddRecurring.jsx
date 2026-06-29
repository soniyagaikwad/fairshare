import { Link, useParams } from 'react-router-dom';
import { useApp, getGroup } from '../context/AppContext';
import RecurringForm from '../components/RecurringForm';

export default function AddRecurring() {
  const { groupId } = useParams();
  const { state } = useApp();
  const group = getGroup(state, groupId);

  if (!group || group.archived) {
    return (
      <div className="empty-state">
        <p>{!group ? 'Group not found.' : 'Archived groups are read-only.'}</p>
        <Link to={group ? `/groups/${groupId}` : '/groups'} className="btn btn--primary">
          Go Back
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link to={`/groups/${groupId}`} className="back-link">← Back to {group.name}</Link>
      <div className="page-header">
        <h1 className="page-header__title">Recurring Expense</h1>
        <p className="page-header__subtitle">Auto-generates on schedule · equal split</p>
      </div>
      <div className="receipt receipt--torn-top">
        <div className="receipt__body">
          <RecurringForm group={group} groupId={groupId} />
        </div>
      </div>
    </div>
  );
}
