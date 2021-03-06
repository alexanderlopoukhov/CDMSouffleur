export const ON_BOARDING_META = [
  {
    key: 'tour-toolbar',
    title: 'Repeat',
    content: 'training anytime by clicking on question mark',
    action: {
      key: 'close',
      title: 'Got it!'
    },
    bullets: [1, 2, 3] // TODO: pass links to other on-boarding steps
  },
  {
    key: 'sql-editor',
    title: 'Ctrl + space',
    content: 'Press hot key to open autocomplete in SQL editor',
    action: {
      title: 'Got it!',
      key: 'close'
    },
    bullets: []
  },

  {
    key: 'create-group',
    title: 'Create Group',
    content: 'Use Ctrl to select multiple fields and then click on Create group',
    action: {
      title: 'Got it!',
      key: 'close'
    },
    bullets: []
  },

  {
    key: 'clone-target',
    title: 'Clone mapping',
    content: 'Use this button to clone mapping for current source and target table',
    action: {
      title: 'Got it!',
      key: 'close'
    },
    bullets: []
  }

];
