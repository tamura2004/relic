'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import { Grail, GrailColor, NightRunner } from '@/types';

interface GrailFormProps {
  open: boolean;
  grail: Grail | null;
  nightRunners: NightRunner[];
  onSave: (grail: Grail) => void;
  onClose: () => void;
}

const GRAIL_COLORS: GrailColor[] = ['赤', '青', '黄', '緑', '無色'];

export default function GrailForm({ open, grail, nightRunners, onSave, onClose }: GrailFormProps) {
  const [nightRunnerId, setNightRunnerId] = useState('');
  const [color1, setColor1] = useState<GrailColor>('赤');
  const [color2, setColor2] = useState<GrailColor>('青');
  const [color3, setColor3] = useState<GrailColor>('黄');

  useEffect(() => {
    if (grail) {
      setNightRunnerId(grail.nightRunnerId);
      setColor1(grail.colors[0]);
      setColor2(grail.colors[1]);
      setColor3(grail.colors[2]);
    } else {
      setNightRunnerId('');
      setColor1('赤');
      setColor2('青');
      setColor3('黄');
    }
  }, [grail]);

  const handleSubmit = () => {
    const newGrail: Grail = {
      id: grail?.id || crypto.randomUUID(),
      nightRunnerId,
      colors: [color1, color2, color3],
    };
    onSave(newGrail);
    setNightRunnerId('');
    setColor1('赤');
    setColor2('青');
    setColor3('黄');
  };

  const isValid = nightRunnerId;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{grail ? '盃を編集' : '盃を登録'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>夜渡り</InputLabel>
            <Select
              value={nightRunnerId}
              label="夜渡り"
              onChange={(e) => setNightRunnerId(e.target.value)}
            >
              {nightRunners.map((nr) => (
                <MenuItem key={nr.id} value={nr.id}>
                  {nr.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>色1</InputLabel>
            <Select value={color1} label="色1" onChange={(e) => setColor1(e.target.value as GrailColor)}>
              {GRAIL_COLORS.map((color) => (
                <MenuItem key={color} value={color}>
                  {color}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>色2</InputLabel>
            <Select value={color2} label="色2" onChange={(e) => setColor2(e.target.value as GrailColor)}>
              {GRAIL_COLORS.map((color) => (
                <MenuItem key={color} value={color}>
                  {color}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>色3</InputLabel>
            <Select value={color3} label="色3" onChange={(e) => setColor3(e.target.value as GrailColor)}>
              {GRAIL_COLORS.map((color) => (
                <MenuItem key={color} value={color}>
                  {color}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!isValid}>
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}
