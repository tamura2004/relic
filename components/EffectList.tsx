'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper,
  IconButton,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Effect, Category } from '@/types';
import { effectStorage, categoryStorage } from '@/lib/storage';
import EffectForm from './EffectForm';

export default function EffectList() {
  const [effects, setEffects] = useState<Effect[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [editingEffect, setEditingEffect] = useState<Effect | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [effectsData, categoriesData] = await Promise.all([
        effectStorage.getAll(),
        categoryStorage.getAll(),
      ]);
      setEffects(effectsData);
      setCategories(categoriesData);
    };
    loadData();
  }, []);

  const handleSave = async (effect: Effect) => {
    let updatedEffects: Effect[];
    if (editingEffect) {
      updatedEffects = effects.map((e) => (e.id === effect.id ? effect : e));
    } else {
      updatedEffects = [...effects, effect];
    }
    setEffects(updatedEffects);
    await effectStorage.save(updatedEffects);
    setIsFormOpen(false);
    setEditingEffect(null);
  };

  const handleDelete = async (id: string) => {
    const updatedEffects = effects.filter((e) => e.id !== id);
    setEffects(updatedEffects);
    await effectStorage.save(updatedEffects);
  };

  const handleEdit = (effect: Effect) => {
    setEditingEffect(effect);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingEffect(null);
    setIsFormOpen(true);
  };

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'その他';
  };

  const filteredEffects = effects
    .filter((effect) => {
      const matchesSearch = effect.description.includes(searchTerm);
      const matchesCategory = !categoryFilter || effect.categoryId === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => a.description.localeCompare(b.description));

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="効果で検索"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
          <Button variant="contained" onClick={handleAdd}>
            新規登録
          </Button>
        </Box>
        <FormControl>
          <FormLabel>カテゴリで絞込</FormLabel>
          <RadioGroup
            row
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <FormControlLabel value="" control={<Radio />} label="すべて" />
            {categories.map((category) => (
              <FormControlLabel
                key={category.id}
                value={category.id}
                control={<Radio />}
                label={category.name}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={150}>カテゴリ</TableCell>
              <TableCell>効果</TableCell>
              <TableCell width={120}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEffects.map((effect) => (
              <TableRow key={effect.id}>
                <TableCell>{getCategoryName(effect.categoryId)}</TableCell>
                <TableCell>{effect.description}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(effect)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(effect.id)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <EffectForm
        open={isFormOpen}
        effect={editingEffect}
        categories={categories}
        effects={effects}
        onSave={handleSave}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEffect(null);
        }}
        defaultCategoryId={categoryFilter}
      />
    </Box>
  );
}
