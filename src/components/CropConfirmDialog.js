import {
  Box, Button, Dialog, DialogActions,
  DialogContent, DialogTitle, Typography,
} from '@mui/material';
import CROP_EMOJIS from '../utils/cropEmojis';

/**
 * Shown when the crop normalizer fuzzy-corrects a user's input.
 * Asks the user to confirm or reject the suggested canonical crop name.
 *
 * Props:
 *   open        {boolean}  — whether the dialog is visible
 *   original    {string}   — what the user typed
 *   suggested   {string}   — canonical English name suggested by normalizer
 *   onConfirm   {fn}       — called when user accepts the suggestion
 *   onReject    {fn}       — called when user rejects the suggestion
 */
export default function CropConfirmDialog({ open, original, suggested, onConfirm, onReject }) {
  const emoji = CROP_EMOJIS[suggested] || '🌱';

  return (
    <Dialog open={open} onClose={onReject} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
        Did you mean?
      </DialogTitle>

      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          {/* Crop emoji as image */}
          <Box sx={{ fontSize: '5rem', lineHeight: 1, mb: 2 }}>
            {emoji}
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
