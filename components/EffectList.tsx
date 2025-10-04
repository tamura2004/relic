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
  InputLabel,
  Select,
  MenuItem,
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
    setEffects(effectStorage.getAll());
    setCategories(categoryStorage.getAll());
  }, []);

  const handleSave = (effect: Effect) => {
    let updatedEffects: Effect[];
    if (editingEffect) {
      updatedEffects = effects.map((e) => (e.id === effect.id ? effect : e));
    } else {
      updatedEffects = [...effects, effect];
    }
    setEffects(updatedEffects);
    effectStorage.save(updatedEffects);
    setIsFormOpen(false);
    setEditingEffect(null);
  };

  const handleDelete = (id: string) => {
    const updatedEffects = effects.filter((e) => e.id !== id);
    setEffects(updatedEffects);
    effectStorage.save(updatedEffects);
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

  const filteredEffects = effects.filter((effect) => {
    const matchesSearch = effect.description.includes(searchTerm);
    const matchesCategory = !categoryFilter || effect.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          label="効果で検索"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>カテゴリで絞込</InputLabel>
          <Select
            value={categoryFilter}
            label="カテゴリで絞込"
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <MenuItem value="">すべて</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleAdd}>
          新規登録
        </Button>
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
        onSave={handleSave}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEffect(null);
        }}
      />
    </Box>
  );
}
