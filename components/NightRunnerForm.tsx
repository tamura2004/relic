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
import { NightRunner } from '@/types';

interface NightRunnerFormProps {
  open: boolean;
  nightRunner: NightRunner | null;
  onSave: (nightRunner: NightRunner) => void;
  onClose: () => void;
}

export default function NightRunnerForm({ open, nightRunner, onSave, onClose }: NightRunnerFormProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (nightRunner) {
      setName(nightRunner.name);
    } else {
      setName('');
    }
  }, [nightRunner]);

  const handleSubmit = () => {
    const newNightRunner: NightRunner = {
      id: nightRunner?.id || crypto.randomUUID(),
      name,
    };
    onSave(newNightRunner);
    setName('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{nightRunner ? '夜渡りを編集' : '夜渡りを登録'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="名前"
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
