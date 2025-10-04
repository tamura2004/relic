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
  Paper,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Category } from '@/types';
import { categoryStorage, DEFAULT_CATEGORY_ID } from '@/lib/storage';
import CategoryForm from './CategoryForm';

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const categoriesData = await categoryStorage.getAll();
      setCategories(categoriesData);
    };
    loadData();
  }, []);

  const handleSave = async (category: Category) => {
    let updatedCategories: Category[];
    if (editingCategory) {
      updatedCategories = categories.map((c) => (c.id === category.id ? category : c));
    } else {
      updatedCategories = [...categories, category];
    }
    setCategories(updatedCategories);
    await categoryStorage.save(updatedCategories);
    setIsFormOpen(false);
    setEditingCategory(null);
  };

  const handleDelete = async (id: string) => {
    // デフォルトカテゴリは削除できない
    if (id === DEFAULT_CATEGORY_ID) {
      alert('「その他」カテゴリは削除できません。');
      return;
    }
    const updatedCategories = categories.filter((c) => c.id !== id);
    setCategories(updatedCategories);
    await categoryStorage.save(updatedCategories);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={handleAdd}>
          新規登録
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>カテゴリ名</TableCell>
              <TableCell width={120}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(category)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(category.id)}
                    size="small"
                    disabled={category.id === DEFAULT_CATEGORY_ID}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <CategoryForm
        open={isFormOpen}
        category={editingCategory}
        onSave={handleSave}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCategory(null);
        }}
      />
    </Box>
  );
}
