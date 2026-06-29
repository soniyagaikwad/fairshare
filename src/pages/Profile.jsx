import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { CURRENCIES } from '../utils/constants';
import { useUI } from '../context/UIContext';

const NOTIFICATION_OPTIONS = [
  { key: 'expenseAdded', label: 'Expense added' },
  { key: 'settlements', label: 'Payment received' },
  { key: 'comments', label: 'Comments' },
];

export default function Profile() {
  const { state, dispatch } = useApp();
  const { showToast } = useUI();
  const fileInputRef = useRef(null);
  const user = state.user;

  const [name, setName] = useState(user.name ?? 'You');
  const [email, setEmail] = useState(user.email ?? '');
  const [defaultCurrency, setDefaultCurrency] = useState(user.defaultCurrency ?? 'USD');
  const [profilePicture, setProfilePicture] = useState(user.profilePicture ?? '');
  const [notifications, setNotifications] = useState({
    expenseAdded: user.notifications?.expenseAdded ?? true,
    settlements: user.notifications?.settlements ?? true,
    comments: user.notifications?.comments ?? true,
  });
  const [error, setError] = useState('');

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProfilePicture(reader.result);
      setError('');
    };
    reader.readAsDataURL(file);
  }

  function toggleNotification(key) {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    dispatch({
      type: 'UPDATE_USER',
      payload: {
        name: name.trim(),
        email: email.trim(),
        defaultCurrency,
        profilePicture: profilePicture || null,
        notifications,
      },
    });
    showToast('Profile saved.');
  }

  function removePhoto() {
    setProfilePicture('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-header__title">Profile</h1>
        <p className="page-header__subtitle">Your account settings</p>
      </div>

      <div className="receipt receipt--torn-top">
        <div className="receipt__body">
          <form onSubmit={handleSubmit}>
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                {profilePicture ? (
                  <img src={profilePicture} alt="" className="profile-avatar__img" />
                ) : (
                  <span className="profile-avatar__initial">
                    {name.trim().charAt(0).toUpperCase() || '?'}
                  </span>
                )}
              </div>
              <div className="profile-avatar__actions">
                <button
                  type="button"
                  className="btn btn--small"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Photo
                </button>
                {profilePicture && (
                  <button
                    type="button"
                    className="btn btn--small btn--danger"
                    onClick={removePhoto}
                  >
                    Remove
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePhotoChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="name">Name</label>
              <input
                id="name"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="currency">Default Currency</label>
              <select
                id="currency"
                className="form-select"
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol}) — {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <div className="receipt__section-label">Notification Preferences</div>
              <p className="profile-note">
                Saved locally — notifications will activate when accounts are enabled.
              </p>
              {NOTIFICATION_OPTIONS.map(({ key, label }) => (
                <label key={key} className="profile-toggle">
                  <input
                    type="checkbox"
                    checked={notifications[key]}
                    onChange={() => toggleNotification(key)}
                  />
                  {label}
                </label>
              ))}
            </div>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="btn btn--primary">Save Profile</button>
          </form>
        </div>
      </div>
    </div>
  );
}
