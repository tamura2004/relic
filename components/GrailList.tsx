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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Grail, NightRunner, GrailColor } from '@/types';
import { grailStorage, nightRunnerStorage } from '@/lib/storage';
import GrailForm from './GrailForm';

export default function GrailList() {
  const [grails, setGrails] = useState<Grail[]>([]);
  const [nightRunners, setNightRunners] = useState<NightRunner[]>([]);
  const [nightRunnerFilter, setNightRunnerFilter] = useState('');
  const [editingGrail, setEditingGrail] = useState<Grail | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [grailsData, nightRunnersData] = await Promise.all([
        grailStorage.getAll(),
        nightRunnerStorage.getAll(),
      ]);
      setGrails(grailsData);
      setNightRunners(nightRunnersData);
    };
    loadData();
  }, []);

  const handleSave = async (grail: Grail) => {
    let updated: Grail[];
    if (editingGrail) {
      updated = grails.map((g) => (g.id === grail.id ? grail : g));
    } else {
      updated = [...grails, grail];
    }
    setGrails(updated);
    await grailStorage.save(updated);
    setIsFormOpen(false);
    setEditingGrail(null);
  };

  const handleDelete = async (id: string) => {
    const updated = grails.filter((g) => g.id !== id);
    setGrails(updated);
    await grailStorage.save(updated);
  };

  const handleEdit = (grail: Grail) => {
    setEditingGrail(grail);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingGrail(null);
    setIsFormOpen(true);
  };

  const getNightRunnerName = (nightRunnerId: string): string => {
    const nightRunner = nightRunners.find((nr) => nr.id === nightRunnerId);
    return nightRunner?.name || '不明';
  };

  const filteredGrails = grails.filter((grail) => {
    return !nightRunnerFilter || grail.nightRunnerId === nightRunnerFilter;
  });

  const getColorChipColor = (color: GrailColor) => {
    const colorMap: Record<GrailColor, 'error' | 'primary' | 'warning' | 'success' | 'default'> = {
      赤: 'error',
      青: 'primary',
      黄: 'warning',
      緑: 'success',
      無色: 'default',
    };
    return colorMap[color];
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>夜渡りで絞込</InputLabel>
          <Select
            value={nightRunnerFilter}
            label="夜渡りで絞込"
            onChange={(e) => setNightRunnerFilter(e.target.value)}
          >
            <MenuItem value="">すべて</MenuItem>
            {nightRunners.map((nr) => (
              <MenuItem key={nr.id} value={nr.id}>
                {nr.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={handleAdd}>
          新規登録
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>夜渡り</TableCell>
              <TableCell width={100}>色1</TableCell>
              <TableCell width={100}>色2</TableCell>
              <TableCell width={100}>色3</TableCell>
              <TableCell width={120}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredGrails.map((grail) => (
              <TableRow key={grail.id}>
                <TableCell>{getNightRunnerName(grail.nightRunnerId)}</TableCell>
                <TableCell>
                  <Chip label={grail.colors[0]} color={getColorChipColor(grail.colors[0])} />
                </TableCell>
                <TableCell>
                  <Chip label={grail.colors[1]} color={getColorChipColor(grail.colors[1])} />
                </TableCell>
                <TableCell>
                  <Chip label={grail.colors[2]} color={getColorChipColor(grail.colors[2])} />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(grail)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(grail.id)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <GrailForm
        open={isFormOpen}
        grail={editingGrail}
        nightRunners={nightRunners}
        onSave={handleSave}
        onClose={() => {
          setIsFormOpen(false);
          setEditingGrail(null);
        }}
      />
    </Box>
  );
}
