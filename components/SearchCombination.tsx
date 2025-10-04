'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { NightRunner, Grail, Relic, Effect, GrailColor, RelicColor } from '@/types';
import { nightRunnerStorage, grailStorage, relicStorage, effectStorage } from '@/lib/storage';

interface GrailRelicMatch {
  grail: Grail;
  relics: Relic[];
}

export default function SearchCombination() {
  const [nightRunners, setNightRunners] = useState<NightRunner[]>([]);
  const [grails, setGrails] = useState<Grail[]>([]);
  const [relics, setRelics] = useState<Relic[]>([]);
  const [effects, setEffects] = useState<Effect[]>([]);

  const [selectedNightRunnerId, setSelectedNightRunnerId] = useState('');
  const [selectedEffectIds, setSelectedEffectIds] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<GrailRelicMatch[]>([]);

  useEffect(() => {
    setNightRunners(nightRunnerStorage.getAll());
    setGrails(grailStorage.getAll());
    setRelics(relicStorage.getAll());
    setEffects(effectStorage.getAll());
  }, []);

  const handleSearch = () => {
    if (!selectedNightRunnerId || selectedEffectIds.length === 0) {
      setSearchResults([]);
      return;
    }

    // 選択された夜渡りまたは「全員」に所属する盃を取得
    const availableGrails = grails.filter((grail) => {
      const nightRunner = nightRunners.find((nr) => nr.id === grail.nightRunnerId);
      return grail.nightRunnerId === selectedNightRunnerId || nightRunner?.name === '全員';
    });

    const results: GrailRelicMatch[] = [];

    // 各盃に対して遺物をマッチング
    for (const grail of availableGrails) {
      const matchedRelics: Relic[] = [];
      const usedRelicIds = new Set<string>();

      // 盃の3つの色それぞれに対して遺物を探す
      for (const grailColor of grail.colors) {
        // この色にマッチする遺物を探す
        const candidateRelics = relics.filter((relic) => {
          // すでに使用済みの遺物は除外
          if (usedRelicIds.has(relic.id)) return false;

          // 色のマッチング（無色はすべての遺物にマッチ）
          if (grailColor !== '無色' && relic.color !== grailColor) return false;

          // まだ見つかっていない効果を含むかチェック
          const relicEffects = relic.effects;
          const hasUnfoundEffect = selectedEffectIds.some((effectId) => {
            // すでに見つかっている効果はスキップ
            const alreadyFound = matchedRelics.some((mr) => mr.effects.includes(effectId));
            if (alreadyFound) return false;

            // この遺物が効果を持っているかチェック
            return relicEffects.includes(effectId);
          });

          return hasUnfoundEffect;
        });

        // 最適な遺物を選択（最も多くの未発見効果を含むもの）
        let bestRelic: Relic | null = null;
        let maxNewEffects = 0;

        for (const relic of candidateRelics) {
          const foundEffects = new Set<string>();
          matchedRelics.forEach((mr) => mr.effects.forEach((e) => foundEffects.add(e)));

          const newEffectsCount = selectedEffectIds.filter(
            (effectId) => relic.effects.includes(effectId) && !foundEffects.has(effectId)
          ).length;

          if (newEffectsCount > maxNewEffects) {
            maxNewEffects = newEffectsCount;
            bestRelic = relic;
          }
        }

        if (bestRelic) {
          matchedRelics.push(bestRelic);
          usedRelicIds.add(bestRelic.id);
        }
      }

      // すべての選択された効果が見つかったかチェック
      const foundEffects = new Set<string>();
      matchedRelics.forEach((relic) => {
        relic.effects.forEach((effectId) => {
          if (selectedEffectIds.includes(effectId)) {
            foundEffects.add(effectId);
          }
        });
      });

      if (foundEffects.size === selectedEffectIds.length) {
        results.push({
          grail,
          relics: matchedRelics,
        });
      }
    }

    setSearchResults(results);
  };

  const getEffectDescription = (effectId: string): string => {
    const effect = effects.find((e) => e.id === effectId);
    return effect?.description || '不明';
  };

  const getNightRunnerName = (nightRunnerId: string): string => {
    const nightRunner = nightRunners.find((nr) => nr.id === nightRunnerId);
    return nightRunner?.name || '不明';
  };

  const getColorChipColor = (color: GrailColor | RelicColor) => {
    const colorMap: Record<GrailColor, 'error' | 'primary' | 'warning' | 'success' | 'default'> = {
      赤: 'error',
      青: 'primary',
      黄: 'warning',
      緑: 'success',
      無色: 'default',
    };
    return colorMap[color as GrailColor];
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          複合検索
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>夜渡り</InputLabel>
            <Select
              value={selectedNightRunnerId}
              label="夜渡り"
              onChange={(e) => setSelectedNightRunnerId(e.target.value)}
            >
              {nightRunners.map((nr) => (
                <MenuItem key={nr.id} value={nr.id}>
                  {nr.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>効果（複数選択可）</InputLabel>
            <Select
              multiple
              value={selectedEffectIds}
              onChange={(e) => setSelectedEffectIds(typeof e.target.value === 'string' ? [e.target.value] : e.target.value)}
              input={<OutlinedInput label="効果（複数選択可）" />}
              renderValue={(selected) => `${selected.length}個選択中`}
            >
              {effects.map((effect) => (
                <MenuItem key={effect.id} value={effect.id}>
                  <Checkbox checked={selectedEffectIds.indexOf(effect.id) > -1} />
                  <ListItemText primary={effect.description} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" onClick={handleSearch} disabled={!selectedNightRunnerId || selectedEffectIds.length === 0}>
            検索
          </Button>
        </Box>
      </Paper>

      {searchResults.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            検索結果: {searchResults.length}件
          </Typography>
          {searchResults.map((result, index) => (
            <Paper key={index} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                盃: {getNightRunnerName(result.grail.nightRunnerId)} - {result.grail.colors.map((c) => c).join('・')}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>色</TableCell>
                      <TableCell>効果1</TableCell>
                      <TableCell>効果2</TableCell>
                      <TableCell>効果3</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {result.relics.map((relic) => (
                      <TableRow key={relic.id}>
                        <TableCell>
                          <Chip label={relic.color} color={getColorChipColor(relic.color)} size="small" />
                        </TableCell>
                        <TableCell>{getEffectDescription(relic.effects[0])}</TableCell>
                        <TableCell>{getEffectDescription(relic.effects[1])}</TableCell>
                        <TableCell>{getEffectDescription(relic.effects[2])}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ))}
        </Box>
      )}

      {searchResults.length === 0 && selectedNightRunnerId && selectedEffectIds.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography color="text.secondary">
            条件に一致する組み合わせが見つかりませんでした。
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
