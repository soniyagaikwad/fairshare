import { Link, useParams } from 'react-router-dom';
import { useApp, getGroup, getRecurring } from '../context/AppContext';
import RecurringForm from '../components/RecurringForm';

export default function EditRecurring() {
  const { groupId, recurringId } = useParams();
  const { state } = useApp();
  const group = getGroup(state, groupId);
  const recurring = getRecurring(state, recurringId);

  if (!group || !recurring) {
    return (
      <div className="empty-state">
        <p>Recurring expense not found.</p>
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
        <h1 className="page-header__title">Edit Recurring</h1>
        <p className="page-header__subtitle">{recurring.description}</p>
      </div>
      <div className="receipt receipt--torn-top">
        <div className="receipt__body">
          <RecurringForm group={group} groupId={groupId} recurring={recurring} />
        </div>
      </div>
    </div>
  );
}
