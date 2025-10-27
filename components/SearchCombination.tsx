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
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { NightRunner, Grail, Relic, Effect, GrailColor, RelicColor, Category, FavoriteCombination } from '@/types';
import { nightRunnerStorage, grailStorage, relicStorage, effectStorage, categoryStorage, favoriteCombinationStorage } from '@/lib/storage';

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
  const [favorites, setFavorites] = useState<FavoriteCombination[]>([]);

  const [selectedNightRunnerId, setSelectedNightRunnerId] = useState('');
  const [selectedEffectIds, setSelectedEffectIds] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<GrailRelicMatch[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const [nightRunnersData, grailsData, relicsData, effectsData, categoriesData, favoritesData] = await Promise.all([
        nightRunnerStorage.getAll(),
        grailStorage.getAll(),
        relicStorage.getAll(),
        effectStorage.getAll(),
        categoryStorage.getAll(),
        favoriteCombinationStorage.getAll(),
      ]);
      setNightRunners(nightRunnersData);
      setGrails(grailsData);
      setRelics(relicsData);
      setEffects(effectsData);
      setCategories(categoriesData);
      setFavorites(favoritesData);
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

    // 各盃に対して全ての可能な遺物の組み合わせを探す
    for (const grail of availableGrails) {
      // 各色に対応する候補遺物を取得
      const candidatesByColor: Relic[][] = grail.colors.map((grailColor) => {
        return relics.filter((relic) => {
          // 色のマッチング（無色はすべての遺物にマッチ）
          if (grailColor !== '無色' && relic.color !== grailColor) return false;

          // 選択された効果のいずれかを持っているかチェック
          return relic.effects.some((effectId) => selectedEffectIds.includes(effectId));
        });
      });

      // 3つの色に対する遺物の全組み合わせを生成
      const combinations: Relic[][] = [];

      function generateCombinations(index: number, current: Relic[]) {
        if (index === 3) {
          // 重複チェック：同じ遺物を使っていないか
          const usedIds = new Set(current.map(r => r.id));
          if (usedIds.size === 3) {
            // すべての効果が含まれているかチェック
            const foundEffects = new Set<string>();
            current.forEach((relic) => {
              relic.effects.forEach((effectId) => {
                if (selectedEffectIds.includes(effectId)) {
                  foundEffects.add(effectId);
                }
              });
            });

            if (foundEffects.size === selectedEffectIds.length) {
              combinations.push([...current]);
            }
          }
          return;
        }

        for (const relic of candidatesByColor[index]) {
          current[index] = relic;
          generateCombinations(index + 1, current);
        }
      }

      generateCombinations(0, []);

      // 見つかった組み合わせをすべて結果に追加
      for (const combination of combinations) {
        results.push({
          grail,
          relics: combination,
        });
      }
    }

    // 重複する組み合わせを除外（順番が違うだけで同じ遺物の組み合わせを削除）
    const uniqueResults: GrailRelicMatch[] = [];
    const seenCombinations = new Set<string>();

    for (const result of results) {
      // 遺物のIDをソートして正規化キーを作成
      const relicIds = result.relics.map(r => r.id).sort().join(',');
      const key = `${result.grail.id}:${relicIds}`;

      if (!seenCombinations.has(key)) {
        seenCombinations.add(key);
        uniqueResults.push(result);
      }
    }

    setSearchResults(uniqueResults);
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

  const isFavorite = (grailId: string, relicIds: string[]): boolean => {
    const sortedRelicIds = [...relicIds].sort();
    return favorites.some(
      (fav) => fav.grailId === grailId && [...fav.relicIds].sort().join(',') === sortedRelicIds.join(',')
    );
  };

  const handleToggleFavorite = async (grail: Grail, relics: Relic[]) => {
    const relicIds = relics.map((r) => r.id) as [string, string, string];
    const favoriteId = `${grail.id}_${[...relicIds].sort().join('_')}`;

    if (isFavorite(grail.id, relicIds)) {
      // お気に入りから削除
      await favoriteCombinationStorage.remove(favoriteId);
      setFavorites(favorites.filter((f) => f.id !== favoriteId));
      setSnackbarMessage('お気に入りから削除しました');
    } else {
      // お気に入りに追加
      await favoriteCombinationStorage.add(grail.id, relicIds);
      const newFavorites = await favoriteCombinationStorage.getAll();
      setFavorites(newFavorites);
      setSnackbarMessage('お気に入りに追加しました');
    }
    setSnackbarOpen(true);
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
              const categoryEffects = effects
                .filter((e) => e.categoryId === category.id)
                .sort((a, b) => a.description.localeCompare(b.description));
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1">
                  盃: {getNightRunnerName(result.grail.nightRunnerId)} - {result.grail.colors.map((c) => c).join('・')}
                </Typography>
                <IconButton
                  onClick={() => handleToggleFavorite(result.grail, result.relics)}
                  color="error"
                  aria-label="お気に入りに追加"
                >
                  {isFavorite(result.grail.id, result.relics.map((r) => r.id)) ? (
                    <FavoriteIcon />
                  ) : (
                    <FavoriteBorderIcon />
                  )}
                </IconButton>
              </Box>
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

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
