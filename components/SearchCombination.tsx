'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  ListItemText,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { NightRunner, Grail, Relic, Effect, GrailColor, RelicColor, Category } from '@/types';
import { nightRunnerStorage, grailStorage, relicStorage, effectStorage, categoryStorage } from '@/lib/storage';

interface GrailRelicMatch {
  grail: Grail;
  relics: Relic[];
}

export default function SearchCombination() {
  const [nightRunners, setNightRunners] = useState<NightRunner[]>([]);
  const [grails, setGrails] = useState<Grail[]>([]);
  const [relics, setRelics] = useState<Relic[]>([]);
  const [effects, setEffects] = useState<Effect[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [selectedNightRunnerId, setSelectedNightRunnerId] = useState('');
  const [selectedEffectIds, setSelectedEffectIds] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<GrailRelicMatch[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [nightRunnersData, grailsData, relicsData, effectsData, categoriesData] = await Promise.all([
        nightRunnerStorage.getAll(),
        grailStorage.getAll(),
        relicStorage.getAll(),
        effectStorage.getAll(),
        categoryStorage.getAll(),
      ]);
      setNightRunners(nightRunnersData);
      setGrails(grailsData);
      setRelics(relicsData);
      setEffects(effectsData);
      setCategories(categoriesData);
    };
    loadData();
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
          <FormControl>
            <FormLabel>夜渡り</FormLabel>
            <RadioGroup
              row
              value={selectedNightRunnerId}
              onChange={(e) => setSelectedNightRunnerId(e.target.value)}
            >
              {nightRunners.map((nr) => (
                <FormControlLabel
                  key={nr.id}
                  value={nr.id}
                  control={<Radio />}
                  label={nr.name}
                />
              ))}
            </RadioGroup>
          </FormControl>

          <Box sx={{ width: '100%' }}>
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              効果（複数選択可）: {selectedEffectIds.length}個選択中
            </Typography>
            {categories.map((category) => {
              const categoryEffects = effects.filter((e) => e.categoryId === category.id);
              if (categoryEffects.length === 0) return null;

              return (
                <Accordion key={category.id}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{category.name} ({categoryEffects.filter(e => selectedEffectIds.includes(e.id)).length}/{categoryEffects.length})</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List sx={{ width: '100%', p: 0 }}>
                      {categoryEffects.map((effect) => (
                        <ListItem
                          key={effect.id}
                          sx={{ px: 0 }}
                          onClick={() => {
                            const newSelection = selectedEffectIds.includes(effect.id)
                              ? selectedEffectIds.filter((id) => id !== effect.id)
                              : [...selectedEffectIds, effect.id];
                            setSelectedEffectIds(newSelection);
                          }}
                        >
                          <Checkbox checked={selectedEffectIds.includes(effect.id)} />
                          <ListItemText primary={effect.description} />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>

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
