import { ACTIVITY_TYPES, CURRENT_USER_ID } from './constants';

const MEMBER_ALEX = 'demo-alex';
const MEMBER_JORDAN = 'demo-jordan';
const MEMBER_SAM = 'demo-sam';

const GROUP_APT = 'demo-group-apt';
const GROUP_TRIP = 'demo-group-trip';
const GROUP_ARCHIVED = 'demo-group-archived';

const EXP_RENT = 'demo-exp-rent';
const EXP_UTILITIES = 'demo-exp-utilities';
const EXP_GROCERIES = 'demo-exp-groceries';
const EXP_DINNER = 'demo-exp-dinner';
const EXP_HOTEL = 'demo-exp-hotel';

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export function createDemoState() {
  return {
    user: {
      id: CURRENT_USER_ID,
      name: 'You',
      email: 'you@fairshare.app',
      defaultCurrency: 'USD',
    },
    groups: [
      {
        id: GROUP_APT,
        name: 'Apartment 4B',
        type: 'household',
        currency: 'USD',
        members: [
          { id: CURRENT_USER_ID, name: 'You' },
          { id: MEMBER_ALEX, name: 'Alex' },
          { id: MEMBER_JORDAN, name: 'Jordan' },
        ],
        simplifyDebts: true,
        createdAt: daysAgo(45),
        archived: false,
      },
      {
        id: GROUP_TRIP,
        name: 'Portland Weekend',
        type: 'trip',
        currency: 'USD',
        members: [
          { id: CURRENT_USER_ID, name: 'You' },
          { id: MEMBER_SAM, name: 'Sam' },
          { id: MEMBER_JORDAN, name: 'Jordan' },
        ],
        simplifyDebts: true,
        createdAt: daysAgo(12),
        archived: false,
      },
      {
        id: GROUP_ARCHIVED,
        name: 'Office Lunch Club',
        type: 'generic',
        currency: 'USD',
        members: [
          { id: CURRENT_USER_ID, name: 'You' },
          { id: MEMBER_ALEX, name: 'Alex' },
        ],
        simplifyDebts: true,
        createdAt: daysAgo(90),
        archived: true,
        archivedAt: daysAgo(7),
      },
    ],
    expenses: [
      {
        id: EXP_RENT,
        groupId: GROUP_APT,
        description: 'June Rent',
        amount: 2400,
        currency: 'USD',
        date: daysAgo(5).split('T')[0],
        category: 'Rent',
        paidBy: CURRENT_USER_ID,
        splitType: 'equal',
        splits: {
          [CURRENT_USER_ID]: 800,
          [MEMBER_ALEX]: 800,
          [MEMBER_JORDAN]: 800,
        },
        participants: [
          { id: CURRENT_USER_ID, included: true },
          { id: MEMBER_ALEX, included: true },
          { id: MEMBER_JORDAN, included: true },
        ],
        notes: 'Auto-paid on the 1st',
        createdBy: CURRENT_USER_ID,
        createdAt: daysAgo(5),
        modifiedAt: daysAgo(5),
        deleted: false,
      },
      {
        id: EXP_UTILITIES,
        groupId: GROUP_APT,
        description: 'Electric + Internet',
        amount: 148.5,
        currency: 'USD',
        date: daysAgo(3).split('T')[0],
        category: 'Utilities',
        paidBy: MEMBER_ALEX,
        splitType: 'unequal',
        splits: {
          [CURRENT_USER_ID]: 45.5,
          [MEMBER_ALEX]: 58,
          [MEMBER_JORDAN]: 45,
        },
        participants: [
          { id: CURRENT_USER_ID, included: true },
          { id: MEMBER_ALEX, included: true },
          { id: MEMBER_JORDAN, included: true },
        ],
        notes: 'Alex works from home — slightly higher share',
        createdBy: MEMBER_ALEX,
        createdAt: daysAgo(3),
        modifiedAt: daysAgo(3),
        deleted: false,
      },
      {
        id: EXP_GROCERIES,
        groupId: GROUP_APT,
        description: 'Trader Joe\'s Run',
        amount: 92.18,
        currency: 'USD',
        date: daysAgo(1).split('T')[0],
        category: 'Groceries',
        paidBy: CURRENT_USER_ID,
        splitType: 'itemized',
        splits: {
          [CURRENT_USER_ID]: 28.74,
          [MEMBER_ALEX]: 35.22,
          [MEMBER_JORDAN]: 28.22,
        },
        participants: [
          { id: CURRENT_USER_ID, included: true },
          { id: MEMBER_ALEX, included: true },
          { id: MEMBER_JORDAN, included: true },
        ],
        notes: '',
        createdBy: CURRENT_USER_ID,
        createdAt: daysAgo(1),
        modifiedAt: daysAgo(1),
        deleted: false,
      },
      {
        id: EXP_DINNER,
        groupId: GROUP_TRIP,
        description: 'Dinner at Tusk',
        amount: 186,
        currency: 'USD',
        date: daysAgo(10).split('T')[0],
        category: 'Food & Dining',
        paidBy: MEMBER_JORDAN,
        splitType: 'equal',
        splits: {
          [CURRENT_USER_ID]: 62,
          [MEMBER_SAM]: 62,
          [MEMBER_JORDAN]: 62,
        },
        participants: [
          { id: CURRENT_USER_ID, included: true },
          { id: MEMBER_SAM, included: true },
          { id: MEMBER_JORDAN, included: true },
        ],
        notes: '',
        createdBy: MEMBER_JORDAN,
        createdAt: daysAgo(10),
        modifiedAt: daysAgo(10),
        deleted: false,
      },
      {
        id: EXP_HOTEL,
        groupId: GROUP_TRIP,
        description: 'Hotel — 2 nights',
        amount: 540,
        currency: 'USD',
        date: daysAgo(11).split('T')[0],
        category: 'Travel',
        paidBy: CURRENT_USER_ID,
        splitType: 'shares',
        splits: {
          [CURRENT_USER_ID]: 180,
          [MEMBER_SAM]: 180,
          [MEMBER_JORDAN]: 180,
        },
        participants: [
          { id: CURRENT_USER_ID, included: true },
          { id: MEMBER_SAM, included: true },
          { id: MEMBER_JORDAN, included: true },
        ],
        notes: 'Split 3 ways — shared room',
        createdBy: CURRENT_USER_ID,
        createdAt: daysAgo(11),
        modifiedAt: daysAgo(11),
        deleted: false,
      },
    ],
    settlements: [
      {
        id: 'demo-settlement-1',
        groupId: GROUP_APT,
        from: MEMBER_JORDAN,
        to: CURRENT_USER_ID,
        amount: 200,
        method: 'Venmo',
        note: 'Partial rent payment',
        createdBy: MEMBER_JORDAN,
        createdAt: daysAgo(2),
      },
    ],
    comments: [
      {
        id: 'demo-comment-1',
        expenseId: EXP_GROCERIES,
        groupId: GROUP_APT,
        userId: MEMBER_ALEX,
        text: 'Can we split the wine separately next time? I bought that just for me.',
        createdAt: daysAgo(1),
      },
    ],
    activities: [
      {
        id: 'demo-act-1',
        groupId: GROUP_APT,
        type: ACTIVITY_TYPES.GROUP_CREATED,
        userId: CURRENT_USER_ID,
        message: 'Group "Apartment 4B" created',
        timestamp: daysAgo(45),
      },
      {
        id: 'demo-act-2',
        groupId: GROUP_TRIP,
        type: ACTIVITY_TYPES.GROUP_CREATED,
        userId: CURRENT_USER_ID,
        message: 'Group "Portland Weekend" created',
        timestamp: daysAgo(12),
      },
      {
        id: 'demo-act-3',
        groupId: GROUP_APT,
        type: ACTIVITY_TYPES.EXPENSE_CREATED,
        userId: CURRENT_USER_ID,
        expenseId: EXP_RENT,
        message: 'Added "June Rent" — 2400',
        timestamp: daysAgo(5),
      },
      {
        id: 'demo-act-4',
        groupId: GROUP_APT,
        type: ACTIVITY_TYPES.EXPENSE_CREATED,
        userId: MEMBER_ALEX,
        expenseId: EXP_UTILITIES,
        message: 'Added "Electric + Internet" — 148.5',
        timestamp: daysAgo(3),
      },
      {
        id: 'demo-act-5',
        groupId: GROUP_APT,
        type: ACTIVITY_TYPES.SETTLEMENT,
        userId: MEMBER_JORDAN,
        message: 'Payment recorded: 200',
        timestamp: daysAgo(2),
      },
      {
        id: 'demo-act-6',
        groupId: GROUP_APT,
        type: ACTIVITY_TYPES.EXPENSE_CREATED,
        userId: CURRENT_USER_ID,
        expenseId: EXP_GROCERIES,
        message: 'Added "Trader Joe\'s Run" — 92.18',
        timestamp: daysAgo(1),
      },
      {
        id: 'demo-act-7',
        groupId: GROUP_APT,
        type: ACTIVITY_TYPES.COMMENT,
        userId: MEMBER_ALEX,
        expenseId: EXP_GROCERIES,
        message: 'Comment added',
        timestamp: daysAgo(1),
      },
      {
        id: 'demo-act-8',
        groupId: GROUP_TRIP,
        type: ACTIVITY_TYPES.EXPENSE_CREATED,
        userId: CURRENT_USER_ID,
        expenseId: EXP_HOTEL,
        message: 'Added "Hotel — 2 nights" — 540',
        timestamp: daysAgo(11),
      },
      {
        id: 'demo-act-9',
        groupId: GROUP_TRIP,
        type: ACTIVITY_TYPES.EXPENSE_CREATED,
        userId: MEMBER_JORDAN,
        expenseId: EXP_DINNER,
        message: 'Added "Dinner at Tusk" — 186',
        timestamp: daysAgo(10),
      },
      {
        id: 'demo-act-10',
        groupId: GROUP_ARCHIVED,
        type: ACTIVITY_TYPES.GROUP_ARCHIVED,
        userId: CURRENT_USER_ID,
        message: 'Group "Office Lunch Club" archived',
        timestamp: daysAgo(7),
      },
    ],
    recurringExpenses: [
      {
        id: 'demo-recurring-internet',
        groupId: GROUP_APT,
        description: 'Internet Bill',
        amount: 65,
        category: 'Utilities',
        paidBy: MEMBER_ALEX,
        splitType: 'equal',
        splits: {
          [CURRENT_USER_ID]: 21.67,
          [MEMBER_ALEX]: 21.67,
          [MEMBER_JORDAN]: 21.66,
        },
        participants: [
          { id: CURRENT_USER_ID, included: true },
          { id: MEMBER_ALEX, included: true },
          { id: MEMBER_JORDAN, included: true },
        ],
        interval: 'monthly',
        intervalDays: null,
        startDate: daysAgo(60).split('T')[0],
        lastGenerated: daysAgo(32),
        active: true,
        createdAt: daysAgo(60),
      },
    ],
  };
}

export const DEMO_WALKTHROUGH = [
  {
    title: 'Home dashboard',
    steps: [
      'Check your balance summary — you should be owed money overall from rent and the trip.',
      'Scan recent activity for expense and settlement events.',
    ],
  },
  {
    title: 'Apartment 4B (household)',
    steps: [
      'Open Balances — see unequal utility split and debt simplification suggestions.',
      'Open Expenses — expand an expense, then Edit to fix a typo or amount.',
      'Open Recurring — view the Internet Bill template; add your own monthly expense.',
      'Use Edit (top right) to change currency or add/remove members.',
      'Go to Settle Up — try overpaying to see validation; use Fill for a valid amount.',
    ],
  },
  {
    title: 'Search & Reports',
    steps: [
      'Search for "rent", "Alex", or a group name from the nav.',
      'Open Reports — review category/monthly breakdown and export CSV.',
    ],
  },
  {
    title: 'Portland Weekend (trip)',
    steps: [
      'Review equal and shares-based splits on existing expenses.',
      'Add an itemized restaurant bill with tax and tip.',
    ],
  },
  {
    title: 'Groups management',
    steps: [
      'Archive a group you\'re done with, then find it under the Archived tab.',
      'Restore or permanently delete from the Archived tab.',
      'Check that archived groups are read-only.',
    ],
  },
];
