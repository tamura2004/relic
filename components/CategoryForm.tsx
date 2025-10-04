'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { Category } from '@/types';

interface CategoryFormProps {
  open: boolean;
  category: Category | null;
  onSave: (category: Category) => void;
  onClose: () => void;
}

export default function CategoryForm({ open, category, onSave, onClose }: CategoryFormProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name);
    } else {
      setName('');
    }
  }, [category]);

  const handleSubmit = () => {
    const newCategory: Category = {
      id: category?.id || crypto.randomUUID(),
      name,
    };
    onSave(newCategory);
    setName('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{category ? 'カテゴリを編集' : 'カテゴリを登録'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="カテゴリ名"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!name}>
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}
