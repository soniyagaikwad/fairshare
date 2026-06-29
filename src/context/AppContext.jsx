import { createContext, useContext, useReducer, useEffect } from 'react';
import { loadState, saveState, DEFAULT_STATE } from '../utils/storage';
import { generateId, ACTIVITY_TYPES, CURRENT_USER_ID } from '../utils/constants';
import { createDemoState } from '../utils/demoData';

const AppContext = createContext(null);

function appReducer(state, action) {
  switch (action.type) {
    case 'CREATE_GROUP': {
      const group = {
        id: generateId(),
        name: action.payload.name,
        type: action.payload.type,
        currency: action.payload.currency,
        members: action.payload.members,
        simplifyDebts: action.payload.simplifyDebts ?? true,
        createdAt: new Date().toISOString(),
        archived: false,
      };
      const activity = {
        id: generateId(),
        groupId: group.id,
        type: ACTIVITY_TYPES.GROUP_CREATED,
        userId: CURRENT_USER_ID,
        message: `Group "${group.name}" created`,
        timestamp: new Date().toISOString(),
      };
      return {
        ...state,
        groups: [...state.groups, group],
        activities: [activity, ...state.activities],
      };
    }

    case 'ADD_EXPENSE': {
      const expense = {
        id: generateId(),
        groupId: action.payload.groupId,
        description: action.payload.description,
        amount: action.payload.amount,
        currency: action.payload.currency,
        date: action.payload.date,
        category: action.payload.category,
        paidBy: action.payload.paidBy,
        splitType: action.payload.splitType,
        splits: action.payload.splits,
        participants: action.payload.participants,
        notes: action.payload.notes ?? '',
        createdBy: CURRENT_USER_ID,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        deleted: false,
      };
      const activity = {
        id: generateId(),
        groupId: expense.groupId,
        type: ACTIVITY_TYPES.EXPENSE_CREATED,
        userId: CURRENT_USER_ID,
        expenseId: expense.id,
        message: `Added "${expense.description}" — ${expense.amount}`,
        timestamp: new Date().toISOString(),
      };
      return {
        ...state,
        expenses: [...state.expenses, expense],
        activities: [activity, ...state.activities],
      };
    }

    case 'DELETE_EXPENSE': {
      const expense = state.expenses.find((e) => e.id === action.payload.expenseId);
      const activity = {
        id: generateId(),
        groupId: expense.groupId,
        type: ACTIVITY_TYPES.EXPENSE_DELETED,
        userId: CURRENT_USER_ID,
        expenseId: expense.id,
        message: `Deleted "${expense.description}"`,
        timestamp: new Date().toISOString(),
      };
      return {
        ...state,
        expenses: state.expenses.map((e) =>
          e.id === action.payload.expenseId ? { ...e, deleted: true } : e
        ),
        activities: [activity, ...state.activities],
      };
    }

    case 'ADD_SETTLEMENT': {
      const settlement = {
        id: generateId(),
        groupId: action.payload.groupId,
        from: action.payload.from,
        to: action.payload.to,
        amount: action.payload.amount,
        method: action.payload.method,
        note: action.payload.note ?? '',
        createdBy: CURRENT_USER_ID,
        createdAt: new Date().toISOString(),
      };
      const activity = {
        id: generateId(),
        groupId: settlement.groupId,
        type: ACTIVITY_TYPES.SETTLEMENT,
        userId: CURRENT_USER_ID,
        message: `Payment recorded: ${settlement.amount}`,
        timestamp: new Date().toISOString(),
      };
      return {
        ...state,
        settlements: [...state.settlements, settlement],
        activities: [activity, ...state.activities],
      };
    }

    case 'ADD_COMMENT': {
      const comment = {
        id: generateId(),
        expenseId: action.payload.expenseId,
        groupId: action.payload.groupId,
        userId: CURRENT_USER_ID,
        text: action.payload.text,
        createdAt: new Date().toISOString(),
      };
      const activity = {
        id: generateId(),
        groupId: comment.groupId,
        type: ACTIVITY_TYPES.COMMENT,
        userId: CURRENT_USER_ID,
        expenseId: comment.expenseId,
        message: `Comment added`,
        timestamp: new Date().toISOString(),
      };
      return {
        ...state,
        comments: [...state.comments, comment],
        activities: [activity, ...state.activities],
      };
    }

    case 'ADD_MEMBER': {
      const group = state.groups.find((g) => g.id === action.payload.groupId);
      const member = {
        id: generateId(),
        name: action.payload.name,
      };
      const activity = {
        id: generateId(),
        groupId: action.payload.groupId,
        type: ACTIVITY_TYPES.MEMBER_JOINED,
        userId: CURRENT_USER_ID,
        message: `${member.name} joined "${group.name}"`,
        timestamp: new Date().toISOString(),
      };
      return {
        ...state,
        groups: state.groups.map((g) =>
          g.id === action.payload.groupId
            ? { ...g, members: [...g.members, member] }
            : g
        ),
        activities: [activity, ...state.activities],
      };
    }

    case 'RENAME_GROUP': {
      const group = state.groups.find((g) => g.id === action.payload.groupId);
      const oldName = group.name;
      const newName = action.payload.name.trim();
      const activity = {
        id: generateId(),
        groupId: group.id,
        type: ACTIVITY_TYPES.GROUP_RENAMED,
        userId: CURRENT_USER_ID,
        message: `Group renamed from "${oldName}" to "${newName}"`,
        timestamp: new Date().toISOString(),
      };
      return {
        ...state,
        groups: state.groups.map((g) =>
          g.id === action.payload.groupId ? { ...g, name: newName } : g
        ),
        activities: [activity, ...state.activities],
      };
    }

    case 'ARCHIVE_GROUP': {
      const group = state.groups.find((g) => g.id === action.payload.groupId);
      const activity = {
        id: generateId(),
        groupId: group.id,
        type: ACTIVITY_TYPES.GROUP_ARCHIVED,
        userId: CURRENT_USER_ID,
        message: `Group "${group.name}" archived`,
        timestamp: new Date().toISOString(),
      };
      return {
        ...state,
        groups: state.groups.map((g) =>
          g.id === action.payload.groupId
            ? { ...g, archived: true, archivedAt: new Date().toISOString() }
            : g
        ),
        activities: [activity, ...state.activities],
      };
    }

    case 'UNARCHIVE_GROUP': {
      const group = state.groups.find((g) => g.id === action.payload.groupId);
      const activity = {
        id: generateId(),
        groupId: group.id,
        type: ACTIVITY_TYPES.GROUP_RESTORED,
        userId: CURRENT_USER_ID,
        message: `Group "${group.name}" restored`,
        timestamp: new Date().toISOString(),
      };
      return {
        ...state,
        groups: state.groups.map((g) =>
          g.id === action.payload.groupId
            ? { ...g, archived: false, archivedAt: null }
            : g
        ),
        activities: [activity, ...state.activities],
      };
    }

    case 'DELETE_GROUP': {
      const groupId = action.payload.groupId;
      const group = state.groups.find((g) => g.id === groupId);
      const activity = {
        id: generateId(),
        groupId,
        type: ACTIVITY_TYPES.GROUP_DELETED,
        userId: CURRENT_USER_ID,
        message: `Group "${group.name}" deleted`,
        timestamp: new Date().toISOString(),
      };
      return {
        ...state,
        groups: state.groups.filter((g) => g.id !== groupId),
        expenses: state.expenses.filter((e) => e.groupId !== groupId),
        settlements: state.settlements.filter((s) => s.groupId !== groupId),
        comments: state.comments.filter((c) => c.groupId !== groupId),
        activities: [activity, ...state.activities.filter((a) => a.groupId !== groupId)],
      };
    }

    case 'LOAD_DEMO_DATA':
      return createDemoState();

    case 'RESET_DATA':
      return { ...DEFAULT_STATE };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, null, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function getGroup(state, groupId) {
  return state.groups.find((g) => g.id === groupId);
}

export function getGroupExpenses(state, groupId) {
  return state.expenses.filter((e) => e.groupId === groupId && !e.deleted);
}

export function getMemberName(group, memberId) {
  if (memberId === CURRENT_USER_ID || memberId === 'user-you') return 'You';
  const member = group.members.find((m) => m.id === memberId);
  return member?.name ?? 'Unknown';
}
