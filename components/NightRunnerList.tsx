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
import { NightRunner } from '@/types';
import { nightRunnerStorage } from '@/lib/storage';
import NightRunnerForm from './NightRunnerForm';

export default function NightRunnerList() {
  const [nightRunners, setNightRunners] = useState<NightRunner[]>([]);
  const [editingNightRunner, setEditingNightRunner] = useState<NightRunner | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    setNightRunners(nightRunnerStorage.getAll());
  }, []);

  const handleSave = (nightRunner: NightRunner) => {
    let updated: NightRunner[];
    if (editingNightRunner) {
      updated = nightRunners.map((nr) => (nr.id === nightRunner.id ? nightRunner : nr));
    } else {
      updated = [...nightRunners, nightRunner];
    }
    setNightRunners(updated);
    nightRunnerStorage.save(updated);
    setIsFormOpen(false);
    setEditingNightRunner(null);
  };

  const handleDelete = (id: string) => {
    const updated = nightRunners.filter((nr) => nr.id !== id);
    setNightRunners(updated);
    nightRunnerStorage.save(updated);
  };

  const handleEdit = (nightRunner: NightRunner) => {
    setEditingNightRunner(nightRunner);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingNightRunner(null);
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
              <TableCell>名前</TableCell>
              <TableCell width={120}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {nightRunners.map((nightRunner) => (
              <TableRow key={nightRunner.id}>
                <TableCell>{nightRunner.name}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(nightRunner)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(nightRunner.id)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <NightRunnerForm
        open={isFormOpen}
        nightRunner={editingNightRunner}
        onSave={handleSave}
        onClose={() => {
          setIsFormOpen(false);
          setEditingNightRunner(null);
        }}
      />
    </Box>
  );
}
