'use client';

import { useState } from 'react';
import { Container, Box, Tabs, Tab, Typography, AppBar, Toolbar } from '@mui/material';
import EffectList from '@/components/EffectList';
import RelicList from '@/components/RelicList';
import CategoryList from '@/components/CategoryList';
import NightRunnerList from '@/components/NightRunnerList';
import GrailList from '@/components/GrailList';
import SearchCombination from '@/components/SearchCombination';
import FavoriteCombinationList from '@/components/FavoriteCombinationList';

export default function Home() {
  const [tabValue, setTabValue] = useState(0);

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            遺物管理システム
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="複合検索" />
            <Tab label="お気に入り" />
            <Tab label="遺物" />
            <Tab label="効果" />
            <Tab label="カテゴリ" />
            <Tab label="夜渡り" />
            <Tab label="盃" />
          </Tabs>
        </Box>
        {tabValue === 0 && <SearchCombination />}
        {tabValue === 1 && <FavoriteCombinationList />}
        {tabValue === 2 && <RelicList />}
        {tabValue === 3 && <EffectList />}
        {tabValue === 4 && <CategoryList />}
        {tabValue === 5 && <NightRunnerList />}
        {tabValue === 6 && <GrailList />}
      </Container>
    </>
  );
}
