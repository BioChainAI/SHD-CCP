//! 64-bit Einstein Tile (RFC 01, draft layout): Form ID bits 36-39, South Halo bits 56-63.

pub const FORM_ID_SHIFT: u32 = 36;
pub const FORM_ID_MASK: u64 = 0xF << FORM_ID_SHIFT;
pub const SOUTH_HALO_SHIFT: u32 = 56;
pub const SOUTH_HALO_MASK: u64 = 0xFF << SOUTH_HALO_SHIFT;
pub const PAYLOAD_MASK: u64 = !(FORM_ID_MASK | SOUTH_HALO_MASK);

#[repr(transparent)]
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub struct EinsteinTile(pub u64);

impl EinsteinTile {
    /// Returns `None` if `form_id > 15` or `payload` overlaps the reserved bits.
    pub const fn pack(form_id: u8, south_halo: u8, payload: u64) -> Option<Self> {
        if form_id > 0xF || payload & !PAYLOAD_MASK != 0 {
            return None;
        }
        Some(Self(
            (south_halo as u64) << SOUTH_HALO_SHIFT | (form_id as u64) << FORM_ID_SHIFT | payload,
        ))
    }

    #[inline]
    pub const fn form_id(self) -> u8 {
        ((self.0 >> FORM_ID_SHIFT) & 0xF) as u8
    }

    #[inline]
    pub const fn south_halo(self) -> u8 {
        (self.0 >> SOUTH_HALO_SHIFT) as u8
    }

    #[inline]
    pub const fn payload(self) -> u64 {
        self.0 & PAYLOAD_MASK
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trip() {
        let t = EinsteinTile::pack(5, 0xA5, 0x01_2345_6789).unwrap();
        assert_eq!((t.form_id(), t.south_halo(), t.payload()), (5, 0xA5, 0x01_2345_6789));
        assert!(EinsteinTile::pack(16, 0, 0).is_none());
        assert!(EinsteinTile::pack(0, 0, FORM_ID_MASK).is_none());
    }
}
