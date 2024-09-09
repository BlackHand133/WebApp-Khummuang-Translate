import { styled } from '@mui/material/styles';
import { TextField, Button, ListItem } from '@mui/material';

export const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
  },
}));

export const EnhancedSaveButton = styled(Button)(({ theme }) => ({
  minWidth: 250,
  height: 60,
  borderRadius: 30,
  fontSize: '1.2rem',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
  },
  '&:active': {
    transform: 'translateY(1px)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
}));

export const RoundedMenuItem = styled(ListItem)(({ theme }) => ({
  borderRadius: 25,
  marginBottom: theme.spacing(1),
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.contrastText,
    },
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    borderRadius: 25,
  },
}));