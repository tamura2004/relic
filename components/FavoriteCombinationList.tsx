'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { FavoriteCombination, Grail, Relic, Effect, NightRunner, GrailColor, RelicColor } from '@/types';
import { favoriteCombinationStorage, grailStorage, relicStorage, effectStorage, nightRunnerStorage } from '@/lib/storage';

export default function FavoriteCombinationList() {
  const [favorites, setFavorites] = useState<FavoriteCombination[]>([]);
  const [grails, setGrails] = useState<Grail[]>([]);
  const [relics, setRelics] = useState<Relic[]>([]);
  const [effects, setEffects] = useState<Effect[]>([]);
  const [nightRunners, setNightRunners] = useState<NightRunner[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFavoriteId, setSelectedFavoriteId] = useState<string | null>(null);
  const [selectedNightRunnerId, setSelectedNightRunnerId] = useState<string>('all');
  const [editingDescriptions, setEditingDescriptions] = useState<Record<string, string>>({});
  const [editingFavoriteId, setEditingFavoriteId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [favoritesData, grailsData, relicsData, effectsData, nightRunnersData] = await Promise.all([
      favoriteCombinationStorage.getAll(),
      grailStorage.getAll(),
      relicStorage.getAll(),
      effectStorage.getAll(),
      nightRunnerStorage.getAll(),
    ]);
    setFavorites(favoritesData);
    setGrails(grailsData);
    setRelics(relicsData);
    setEffects(effectsData);
    setNightRunners(nightRunnersData);
  };

  const getGrail = (grailId: string): Grail | undefined => {
    return grails.find((g) => g.id === grailId);
  };

  const getRelic = (relicId: string): Relic | undefined => {
    return relics.find((r) => r.id === relicId);
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

  const handleDeleteClick = (favoriteId: string) => {
    setSelectedFavoriteId(favoriteId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedFavoriteId) {
      await favoriteCombinationStorage.remove(selectedFavoriteId);
      await loadData();
      setDeleteDialogOpen(false);
      setSelectedFavoriteId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedFavoriteId(null);
  };

  const handleDescriptionClick = (favorite: FavoriteCombination) => {
    setEditingFavoriteId(favorite.id);
    setEditingDescriptions((prev) => ({
      ...prev,
      [favorite.id]: favorite.description || '',
    }));
  };

  const handleDescriptionChange = (favoriteId: string, value: string) => {
    setEditingDescriptions((prev) => ({
      ...prev,
      [favoriteId]: value,
    }));
  };

  const handleDescriptionBlur = async (favoriteId: string) => {
    const newDescription = editingDescriptions[favoriteId];
    if (newDescription !== undefined) {
      await favoriteCombinationStorage.update(favoriteId, newDescription);
      await loadData();
    }
    setEditingFavoriteId(null);
    setEditingDescriptions((prev) => {
      const newState = { ...prev };
      delete newState[favoriteId];
      return newState;
    });
  };

  // 夜渡りでフィルタリングされたお気に入りを取得
  const filteredFavorites = favorites.filter((favorite) => {
    if (selectedNightRunnerId === 'all') return true;
    const grail = getGrail(favorite.grailId);
    if (!grail) return false;
    return grail.nightRunnerId === selectedNightRunnerId;
  });

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        お気に入り: {filteredFavorites.length}件
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>夜渡り</InputLabel>
          <Select
            value={selectedNightRunnerId}
            label="夜渡り"
            onChange={(e) => setSelectedNightRunnerId(e.target.value)}
          >
            <MenuItem value="all">すべて</MenuItem>
            {nightRunners.map((nr) => (
              <MenuItem key={nr.id} value={nr.id}>
                {nr.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {filteredFavorites.length === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography color="text.secondary">
            お気に入りに登録された組み合わせはありません。
          </Typography>
        </Paper>
      )}

      {filteredFavorites.map((favorite) => {
        const grail = getGrail(favorite.grailId);
        if (!grail) return null;

        const favoriteRelics = favorite.relicIds
          .map((relicId) => getRelic(relicId))
          .filter((relic): relic is Relic => relic !== undefined);

        if (favoriteRelics.length !== 3) return null;

        return (
          <Paper key={favorite.id} sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <Typography variant="subtitle1" sx={{ whiteSpace: 'nowrap' }}>
                  盃: {getNightRunnerName(grail.nightRunnerId)} - {grail.colors.map((c) => c).join('・')}
                </Typography>
                {editingFavoriteId === favorite.id ? (
                  <TextField
                    autoFocus
                    fullWidth
                    size="small"
                    placeholder="説明を入力..."
                    value={editingDescriptions[favorite.id] ?? ''}
                    onChange={(e) => handleDescriptionChange(favorite.id, e.target.value)}
                    onBlur={() => handleDescriptionBlur(favorite.id)}
                  />
                ) : (
                  <Typography
                    variant="body2"
                    sx={{
                      color: favorite.description ? 'text.primary' : 'text.disabled',
                      cursor: 'pointer',
                      flex: 1,
                      '&:hover': { backgroundColor: 'action.hover' },
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                    }}
                    onClick={() => handleDescriptionClick(favorite)}
                  >
                    {favorite.description || '説明を入力...'}
                  </Typography>
                )}
              </Box>
              <IconButton
                onClick={() => handleDeleteClick(favorite.id)}
                color="error"
                aria-label="お気に入りから削除"
              >
                <DeleteIcon />
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
                  {favoriteRelics.map((relic) => (
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
        );
      })}

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">お気に入りを削除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            この組み合わせをお気に入りから削除してもよろしいですか？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            キャンセル
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            削除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
