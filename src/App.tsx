import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AuthSequencingCardView from './AuthSequencingCardView';
import AuthSequencingTableR2 from './AuthSequencingTableR2';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

type Page = 'home' | 'auth-cards' | 'auth-table-r2';

function getPageFromHash(): Page {
  const hash = window.location.hash.replace('#', '');
  if (hash === 'auth-cards') return 'auth-cards';
  if (hash === 'auth-table-r2') return 'auth-table-r2';
  return 'home';
}

function navigate(page: Page) {
  window.location.hash = page === 'home' ? '' : page;
}

function NavBar({ current, collapsed, onToggle }: { current: Page; collapsed: boolean; onToggle: () => void }) {
  if (collapsed) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          px: 3,
        }}
      >
        <IconButton size="small" onClick={onToggle} sx={{ py: 0.25 }}>
          <KeyboardArrowDownIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 3,
        py: 1.5,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        flexWrap: 'wrap',
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 700, cursor: 'pointer', mr: 1 }}
        onClick={() => navigate('home')}
      >
        Auth Sequencing Concepts
      </Typography>

      <Button
        size="small"
        variant={current === 'auth-cards' ? 'contained' : 'text'}
        onClick={() => navigate('auth-cards')}
      >
        Cards+
      </Button>
      <Button
        size="small"
        variant={current === 'auth-table-r2' ? 'contained' : 'text'}
        onClick={() => navigate('auth-table-r2')}
      >
        Table R2
      </Button>

      <Box sx={{ ml: 'auto' }}>
        <IconButton size="small" onClick={onToggle}>
          <KeyboardArrowUpIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}

type ConceptEntry = { page: Page; label: string };

const CONCEPTS: ConceptEntry[] = [
  { page: 'auth-cards',     label: 'Cards+' },
  { page: 'auth-table-r2', label: 'Table R2' },
];

function ConceptList({ entries }: { entries: ConceptEntry[] }) {
  return (
    <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
      {entries.map(({ page, label }) => (
        <Box
          component="li"
          key={page}
          onClick={() => navigate(page)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 1.5,
            py: 1,
            borderRadius: 1,
            cursor: 'pointer',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'text.disabled', flexShrink: 0 }} />
          <Typography variant="body2">{label}</Typography>
        </Box>
      ))}
    </Box>
  );
}

function HomePage() {
  return (
    <Box sx={{ p: 4, maxWidth: 560, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Auth Sequencing Concepts
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Customer session prototypes.
      </Typography>

      <Divider sx={{ mb: 1 }} />
      <ConceptList entries={CONCEPTS} />
    </Box>
  );
}

function App() {
  const [page, setPage] = useState<Page>(getPageFromHash);
  const [navCollapsed, setNavCollapsed] = useState(false);

  useEffect(() => {
    const onHashChange = () => setPage(getPageFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NavBar current={page} collapsed={navCollapsed} onToggle={() => setNavCollapsed((c) => !c)} />
      {page === 'home' && <HomePage />}
      {page === 'auth-cards' && <AuthSequencingCardView />}
      {page === 'auth-table-r2' && <AuthSequencingTableR2 />}
    </ThemeProvider>
  );
}

export default App;
