'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
} from '@mui/material';
import { Effect, Category } from '@/types';
import { DEFAULT_CATEGORY_ID } from '@/lib/storage';

interface EffectFormProps {
  open: boolean;
  effect: Effect | null;
  categories: Category[];
  effects: Effect[];
  onSave: (effect: Effect) => void;
  onClose: () => void;
  defaultCategoryId?: string;
}

export default function EffectForm({ open, effect, categories, effects, onSave, onClose, defaultCategoryId }: EffectFormProps) {
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(DEFAULT_CATEGORY_ID);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (effect) {
      setDescription(effect.description);
      setCategoryId(effect.categoryId || DEFAULT_CATEGORY_ID);
    } else {
      setDescription('');
      setCategoryId(defaultCategoryId || DEFAULT_CATEGORY_ID);
    }
    setErrorMessage('');
  }, [effect, defaultCategoryId]);

  const handleSubmit = () => {
    // 重複チェック（編集中の効果自身は除外）
    const duplicate = effects.find(
      (e) => e.categoryId === categoryId &&
             e.description === description &&
             e.id !== effect?.id
    );

    if (duplicate) {
      setErrorMessage('同じカテゴリに同じ効果が既に登録されています。');
      return;
    }

    const newEffect: Effect = {
      id: effect?.id || crypto.randomUUID(),
      categoryId,
      description,
    };
    onSave(newEffect);
    setDescription('');
    setCategoryId(DEFAULT_CATEGORY_ID);
    setErrorMessage('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{effect ? '効果を編集' : '効果を登録'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {errorMessage && (
            <Alert severity="error">{errorMessage}</Alert>
          )}
          <FormControl fullWidth>
            <InputLabel>カテゴリ</InputLabel>
            <Select
              value={categoryId}
              label="カテゴリ"
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            autoFocus
            label="効果"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!description}>
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}
