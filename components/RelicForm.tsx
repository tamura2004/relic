'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
} from '@mui/material';
import { Relic, RelicColor, Effect, Category } from '@/types';
import { DEFAULT_CATEGORY_ID } from '@/lib/storage';

interface RelicFormProps {
  open: boolean;
  relic: Relic | null;
  effects: Effect[];
  categories: Category[];
  onSave: (relic: Relic) => void;
  onClose: () => void;
}

export default function RelicForm({ open, relic, effects, categories, onSave, onClose }: RelicFormProps) {
  const [color, setColor] = useState<RelicColor>('赤');
  const [effect1, setEffect1] = useState('');
  const [effect2, setEffect2] = useState('');
  const [effect3, setEffect3] = useState('');
  const [category1, setCategory1] = useState('');
  const [category2, setCategory2] = useState('');
  const [category3, setCategory3] = useState('');

  useEffect(() => {
    if (relic) {
      setColor(relic.color);
      setEffect1(relic.effects[0]);
      setEffect2(relic.effects[1]);
      setEffect3(relic.effects[2]);

      // 既存の効果からカテゴリを復元
      const e1 = effects.find(e => e.id === relic.effects[0]);
      const e2 = effects.find(e => e.id === relic.effects[1]);
      const e3 = effects.find(e => e.id === relic.effects[2]);
      setCategory1(e1?.categoryId || '');
      setCategory2(e2?.categoryId || '');
      setCategory3(e3?.categoryId || '');
    } else {
      setColor('赤');
      setEffect1('');
      setEffect2('');
      setEffect3('');
      setCategory1(DEFAULT_CATEGORY_ID);
      setCategory2(DEFAULT_CATEGORY_ID);
      setCategory3(DEFAULT_CATEGORY_ID);
    }
  }, [relic, effects]);

  const filteredEffects1 = useMemo(() =>
    category1 ? effects.filter(e => e.categoryId === category1) : [],
    [effects, category1]
  );

  const filteredEffects2 = useMemo(() =>
    category2 ? effects.filter(e => e.categoryId === category2) : [],
    [effects, category2]
  );

  const filteredEffects3 = useMemo(() =>
    category3 ? effects.filter(e => e.categoryId === category3) : [],
    [effects, category3]
  );

  const handleCategoryChange1 = (newCategory: string) => {
    setCategory1(newCategory);
    setEffect1(''); // カテゴリ変更時に効果をリセット
  };

  const handleCategoryChange2 = (newCategory: string) => {
    setCategory2(newCategory);
    setEffect2('');
  };

  const handleCategoryChange3 = (newCategory: string) => {
    setCategory3(newCategory);
    setEffect3('');
  };

  const handleSubmit = () => {
    const newRelic: Relic = {
      id: relic?.id || crypto.randomUUID(),
      color,
      effects: [effect1, effect2, effect3],
    };
    onSave(newRelic);
    setColor('赤');
    setEffect1('');
    setEffect2('');
    setEffect3('');
    setCategory1(DEFAULT_CATEGORY_ID);
    setCategory2(DEFAULT_CATEGORY_ID);
    setCategory3(DEFAULT_CATEGORY_ID);
  };

  const isValid = effect1 && effect2 && effect3;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{relic ? '遺物を編集' : '遺物を登録'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend">色</FormLabel>
            <RadioGroup
              row
              value={color}
              onChange={(e) => setColor(e.target.value as RelicColor)}
            >
              <FormControlLabel value="赤" control={<Radio />} label="赤" />
              <FormControlLabel value="青" control={<Radio />} label="青" />
              <FormControlLabel value="黄" control={<Radio />} label="黄" />
              <FormControlLabel value="緑" control={<Radio />} label="緑" />
            </RadioGroup>
          </FormControl>

          <Typography variant="subtitle2" sx={{ mt: 1 }}>効果1</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ width: '20%' }}>
              <InputLabel>カテゴリ</InputLabel>
              <Select
                value={category1}
                label="カテゴリ"
                onChange={(e) => handleCategoryChange1(e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ width: '80%' }} disabled={!category1}>
              <InputLabel>効果</InputLabel>
              <Select value={effect1} label="効果" onChange={(e) => setEffect1(e.target.value)}>
                {filteredEffects1.map((effect) => (
                  <MenuItem key={effect.id} value={effect.id}>
                    {effect.description}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Typography variant="subtitle2" sx={{ mt: 1 }}>効果2</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ width: '20%' }}>
              <InputLabel>カテゴリ</InputLabel>
              <Select
                value={category2}
                label="カテゴリ"
                onChange={(e) => handleCategoryChange2(e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ width: '80%' }} disabled={!category2}>
              <InputLabel>効果</InputLabel>
              <Select value={effect2} label="効果" onChange={(e) => setEffect2(e.target.value)}>
                {filteredEffects2.map((effect) => (
                  <MenuItem key={effect.id} value={effect.id}>
                    {effect.description}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Typography variant="subtitle2" sx={{ mt: 1 }}>効果3</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ width: '20%' }}>
              <InputLabel>カテゴリ</InputLabel>
              <Select
                value={category3}
                label="カテゴリ"
                onChange={(e) => handleCategoryChange3(e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ width: '80%' }} disabled={!category3}>
              <InputLabel>効果</InputLabel>
              <Select value={effect3} label="効果" onChange={(e) => setEffect3(e.target.value)}>
                {filteredEffects3.map((effect) => (
                  <MenuItem key={effect.id} value={effect.id}>
                    {effect.description}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
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
