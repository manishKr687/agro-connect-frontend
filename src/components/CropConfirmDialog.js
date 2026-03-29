import { useEffect, useState } from 'react';
import {
  Box, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Typography,
} from '@mui/material';
import CROP_EMOJIS from '../utils/cropEmojis';

/**
 * Shown when the crop normalizer fuzzy-corrects a user's input.
 * Fetches a real image from Wikipedia and asks the user to confirm
 * or reject the suggested canonical crop name.
 *
 * Props:
 *   open        {boolean}  — whether the dialog is visible
 *   original    {string}   — what the user typed
 *   suggested   {string}   — canonical English name suggested by normalizer
 *   onConfirm   {fn}       — called when user accepts the suggestion
 *   onReject    {fn}       — called when user rejects the suggestion
 */
export default function CropConfirmDialog({ open, original, suggested, onConfirm, onReject }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading]   = useState(false);
  const emoji = CROP_EMOJIS[suggested] || '🌱';

  useEffect(() => {
    if (!open || !suggested) return;

    setImageUrl(null);
    setLoading(true);

    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(suggested)}`)
      .then((res) => res.json())
      .then((data) => {
        setImageUrl(data?.thumbnail?.source || null);
      })
      .catch(() => setImageUrl(null))
      .finally(() => setLoading(false));
  }, [open, suggested]);

  return (
    <Dialog open={open} onClose={onReject} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
        Did you mean?
      </DialogTitle>

      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 2 }}>

          {/* Image area */}
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 140 }}>
            {loading ? (
              <CircularProgress size={48} color="success" />
            ) : imageUrl ? (
              <Box
                component="img"
                src={imageUrl}
                alt={suggested}
                sx={{ height: 140, width: 140, objectFit: 'cover', borderRadius: 3, boxShadow: 3 }}
              />
            ) : (
              <Box sx={{ fontSize: '5rem', lineHeight: 1 }}>{emoji}</Box>
            )}
          </Box>

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {suggested}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            You typed: <em>"{original}"</em>
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', gap: 1, pb: 2 }}>
        <Button variant="contained" color="success" onClick={onConfirm}>
          Yes, use "{suggested}"
        </Button>
        <Button variant="outlined" color="error" onClick={onReject}>
          No, keep mine
        </Button>
      </DialogActions>
    </Dialog>
  );
}
