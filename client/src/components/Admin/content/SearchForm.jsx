import React, { useCallback, createContext, useContext, useRef } from 'react';
import { Paper, Grid, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

// SearchContext
export const SearchContext = createContext();
export const useSearch = () => useContext(SearchContext);

// useDebounce hook
const useDebounce = (func, delay) => {
  const timeoutRef = useRef();
  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => func(...args), delay);
  }, [func, delay]);
};

const SearchForm = React.memo(() => {
  const { searchParams, updateSearchParams } = useSearch();

  const debouncedUpdateSearchParams = useDebounce(updateSearchParams, 300);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    debouncedUpdateSearchParams({ [name]: value });
  }, [debouncedUpdateSearchParams]);
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Search Username or Email"
            name="query"
            value={searchParams.query || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <TextField
            fullWidth
            label="Min Age"
            name="minAge"
            type="number"
            value={searchParams.minAge || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <TextField
            fullWidth
            label="Max Age"
            name="maxAge"
            type="number"
            value={searchParams.maxAge || ''}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={2}>
          <FormControl fullWidth>
            <InputLabel>Gender</InputLabel>
            <Select
              name="gender"
              value={searchParams.gender || ''}
              onChange={handleChange}
              label="Gender"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} sm={6} md={2}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              name="isActive"
              value={searchParams.isActive || ''}
              onChange={handleChange}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
});

export default SearchForm;
