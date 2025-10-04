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
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Relic, RelicColor, Effect, Category } from '@/types';
import { relicStorage, effectStorage, categoryStorage } from '@/lib/storage';
import RelicForm from './RelicForm';

export default function RelicList() {
  const [relics, setRelics] = useState<Relic[]>([]);
  const [effects, setEffects] = useState<Effect[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [colorFilter, setColorFilter] = useState<RelicColor | ''>('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [editingRelic, setEditingRelic] = useState<Relic | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    setRelics(relicStorage.getAll());
    setEffects(effectStorage.getAll());
    setCategories(categoryStorage.getAll());
  }, []);

  const handleSave = (relic: Relic) => {
    let updatedRelics: Relic[];
    if (editingRelic) {
      updatedRelics = relics.map((r) => (r.id === relic.id ? relic : r));
    } else {
      updatedRelics = [...relics, relic];
    }
    setRelics(updatedRelics);
    relicStorage.save(updatedRelics);
    setIsFormOpen(false);
    setEditingRelic(null);
  };

  const handleDelete = (id: string) => {
    const updatedRelics = relics.filter((r) => r.id !== id);
    setRelics(updatedRelics);
    relicStorage.save(updatedRelics);
  };

  const handleEdit = (relic: Relic) => {
    setEditingRelic(relic);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingRelic(null);
    setIsFormOpen(true);
  };

  const getEffectDescription = (effectId: string): string => {
    const effect = effects.find((e) => e.id === effectId);
    return effect?.description || '不明な効果';
  };

  const filteredRelics = relics.filter((relic) => {
    const matchesColor = !colorFilter || relic.color === colorFilter;
    const matchesEffect =
      !searchTerm ||
      relic.effects.some((effectId) =>
        getEffectDescription(effectId).includes(searchTerm)
      );
    const matchesCategory =
      !categoryFilter ||
      relic.effects.some((effectId) => {
        const effect = effects.find((e) => e.id === effectId);
        return effect?.categoryId === categoryFilter;
      });
    return matchesColor && matchesEffect && matchesCategory;
  });

  const getColorChipColor = (color: RelicColor) => {
    const colorMap: Record<RelicColor, 'error' | 'primary' | 'warning' | 'success'> = {
      赤: 'error',
      青: 'primary',
      黄: 'warning',
      緑: 'success',
    };
    return colorMap[color];
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          label="効果で検索"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />
        <FormControl sx={{ minWidth: 150 }}>
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
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>色で絞込</InputLabel>
          <Select
            value={colorFilter}
            label="色で絞込"
            onChange={(e) => setColorFilter(e.target.value as RelicColor | '')}
          >
            <MenuItem value="">すべて</MenuItem>
            <MenuItem value="赤">赤</MenuItem>
            <MenuItem value="青">青</MenuItem>
            <MenuItem value="黄">黄</MenuItem>
            <MenuItem value="緑">緑</MenuItem>
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
              <TableCell width={80}>色</TableCell>
              <TableCell>効果1</TableCell>
              <TableCell>効果2</TableCell>
              <TableCell>効果3</TableCell>
              <TableCell width={120}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRelics.map((relic) => (
              <TableRow key={relic.id}>
                <TableCell>
                  <Chip label={relic.color} color={getColorChipColor(relic.color)} />
                </TableCell>
                <TableCell>{getEffectDescription(relic.effects[0])}</TableCell>
                <TableCell>{getEffectDescription(relic.effects[1])}</TableCell>
                <TableCell>{getEffectDescription(relic.effects[2])}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(relic)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(relic.id)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <RelicForm
        open={isFormOpen}
        relic={editingRelic}
        effects={effects}
        categories={categories}
        onSave={handleSave}
        onClose={() => {
          setIsFormOpen(false);
          setEditingRelic(null);
        }}
      />
    </Box>
  );
}
