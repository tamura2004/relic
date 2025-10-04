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
} from '@mui/material';
import { Effect, Category } from '@/types';
import { DEFAULT_CATEGORY_ID } from '@/lib/storage';

interface EffectFormProps {
  open: boolean;
  effect: Effect | null;
  categories: Category[];
  onSave: (effect: Effect) => void;
  onClose: () => void;
  defaultCategoryId?: string;
}

export default function EffectForm({ open, effect, categories, onSave, onClose, defaultCategoryId }: EffectFormProps) {
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(DEFAULT_CATEGORY_ID);

  useEffect(() => {
    if (effect) {
      setDescription(effect.description);
      setCategoryId(effect.categoryId || DEFAULT_CATEGORY_ID);
    } else {
      setDescription('');
      setCategoryId(defaultCategoryId || DEFAULT_CATEGORY_ID);
    }
  }, [effect, defaultCategoryId]);

  const handleSubmit = () => {
    const newEffect: Effect = {
      id: effect?.id || crypto.randomUUID(),
      categoryId,
      description,
    };
    onSave(newEffect);
    setDescription('');
    setCategoryId(DEFAULT_CATEGORY_ID);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{effect ? '効果を編集' : '効果を登録'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
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
